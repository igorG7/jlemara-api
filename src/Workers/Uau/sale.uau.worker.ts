// src/Workers/Uau/sale.uau.worker.ts
//
// Worker de sincronismo ETL — módulo Venda (UAU → MongoDB)
//
// Estratégia geral (ver VENDA_STUDY.md seções 11–12):
//   1. Resgata chaves de vendas por período via RetornaChavesVendasPorPeriodo
//   2. Filtra obras elegíveis (R0/J0)
//   3. Processa em chunks de 3 com delay de 1s (conservador: 2 chamadas/venda = 6 concurrent total)
//   4. Para cada venda, busca em PARALELO:
//      a. ConsultarResumoVenda     → snapshot financeiro + indicadores de inadimplência
//      b. BuscarParcelasAReceber   → parcelas em aberto com valores calculados
//   5. Persiste inline (não batch) via formatSaleAndSave — evita acúmulo de memória
//
// Carga inicial: chamar start() por janela anual em madrugada (ver seção 11.1)
// Delta diário:  chamar start() com janela dos últimos 30 dias (ver seção 11.2)
//
import fs from "fs";
import path from "path";
import Console, { ConsoleData } from "../../Lib/Console";
import UauSaleService from "../../Services/Uau/Sale/uau.sale.service";
import { ResumoVenda, ParcelaAReceber } from "../../Services/Uau/Sale/uau.sale.types";

const SALES_SAMPLES_DIR = path.resolve(__dirname, "../../Services/Uau/Sale/samples/sales");

// Prefixos de obra elegíveis para sincronismo.
// R0 = empreendimentos residenciais, J0 = empreendimentos comerciais/jurídico.
// Obras com outros prefixos (ex: B, F) não são de interesse do produto atual.
const OBRA_PREFIXOS_VALIDOS = ["R0", "J0"];

// CHUNK_SIZE = 3 com 2 chamadas/venda = 6 concurrent requests → conservador para a API UAU.
// Se a API UAU aguentar, pode elevar para 5 (= 10 concurrent).
// CustomerUauWorker usa 10, UnidadeUauWorker usa 50 — mas ambos fazem 1 chamada/item.
const CHUNK_SIZE = 10; // ! GENTILEZA NÃO AUMENTAR ESSE NUMERO | ass apiUau :'(   ! \\
// * ULTIMO TESTE - 38 VENDAS = 1:58.459 M:SS.MMM
export type SaleSnapshot = {
  resumo: ResumoVenda;
  parcelas: ParcelaAReceber[]; // parcelas em aberto — pré-calculadas na data de consulta
};

export default class SaleUauWorker {
  private saleService = new UauSaleService();

  // Guard para evitar execuções concorrentes do mesmo worker.
  private isRunning = false;

  async start(dataInicio: string, dataFim: string) {
    if (this.isRunning) return;
    try {
      this.isRunning = true;
      await this.rescueErpSales(dataInicio, dataFim);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Problemas na inicialização do worker ETL de vendas";
      Console({ type: "error", message });
      ConsoleData({ type: "error", data: error });
    } finally {
      // finally garante reset do flag mesmo em caso de erro não capturado internamente
      this.isRunning = false;
    }
  }

  private async rescueErpSales(dataInicio: string, dataFim: string) {
    console.time("⏳ tempo total worker vendas ⏳");

    Console({ type: "log", message: `Iniciando verificação de vendas no ERP UAU — período: ${dataInicio} a ${dataFim}.` });

    try {

      // ─── 1. Resgatar chaves de vendas do período ──────────────────────────
      //
      // RetornaChavesVendasPorPeriodo retorna string CSV "01-R0123/00151,...".
      // statusVenda "0" = apenas vendas Normais (ativas).
      // Para delta diário: janela de 30 dias captura novos contratos +
      // renegociações e movimentações financeiras em contratos antigos.
      console.time("⏳ tempo busca chaves ⏳");
      const raw = await this.saleService.retornaChavesVendas(dataInicio, dataFim, "0");
      console.timeEnd("⏳ tempo busca chaves ⏳");

      // ─── 2. Transformar em objetos e filtrar obras elegíveis ──────────────
      const todasAsChaves = this.saleService.parseChavesVendas(raw);

      const chavesFiltradas = todasAsChaves.filter((c) =>
        OBRA_PREFIXOS_VALIDOS.some((prefixo) => String(c.Obra).startsWith(prefixo))
      );

      Console({
        type: "log",
        message: `${todasAsChaves.length} chaves retornadas → ${chavesFiltradas.length} elegíveis (prefixos: ${OBRA_PREFIXOS_VALIDOS.join(", ")}).`,
      });

      if (!chavesFiltradas.length) {
        Console({ type: "warn", message: "Nenhuma venda elegível encontrada no período." });
        return;
      }

      // ─── 3. Limite de segurança por execução ─────────────────────────────
      //
      // Evita processar janelas grandes (ex: 1 ano) em ciclo único.
      // Para carga completa: segmentar por janelas anuais (ver VENDA_STUDY.md seção 11.1).
      // Estimativa: 100 vendas × (resumo ~500ms + parcelas ~500ms) + delays
      //             = ~4–6 min/run — dentro do aceitável para cron noturno.
      const dataToProcess = chavesFiltradas.slice(0, 50); // LIMITE DE SEGURANÇA

      Console({ type: "log", message: `Processando ${dataToProcess.length} de ${chavesFiltradas.length} vendas elegíveis.` });

      // ─── 4. Processar em chunks com paralelismo controlado ────────────────
      //
      // Por venda: 2 chamadas em paralelo (resumo + parcelas) via Promise.all interno.
      // CHUNK_SIZE=3 → 6 chamadas concorrentes à UAU — conservador até medirmos o throttling real.
      // Delay de 1s entre lotes = padrão dos demais workers (CustomerUauWorker, UnidadeUauWorker).
      //
      // Persistência INLINE: cada venda é salva imediatamente após fetch
      // (não acumula array em memória antes de persistir — importante com parcelas embutidas).
      let saved = 0;
      let errorCount = 0;

      console.time("⏳ tempo total processamento ⏳");

      for (let i = 0; i < dataToProcess.length; i += CHUNK_SIZE) {
        const chunk = dataToProcess.slice(i, i + CHUNK_SIZE);

        Console({
          type: "log",
          message: `Processando lote ${Math.floor(i / CHUNK_SIZE) + 1} — vendas ${i + 1} a ${Math.min(i + CHUNK_SIZE, dataToProcess.length)} de ${dataToProcess.length}...`,
        });

        await Promise.all(
          chunk.map(async (chave) => {
            try {
              // ── Busca resumo financeiro e parcelas em aberto em paralelo ──
              //
              // ConsultarResumoVenda → snapshot financeiro completo (score de adimplência, saldo, etc.)
              // BuscarParcelasAReceber → parcelas em aberto com valores calculados na data de hoje
              //   → EmBancoPrc=1 indica boleto gerado; ValorReaj é o valor atualizado pelo índice
              const [resumo, parcelas] = await Promise.all([
                this.saleService.consultarResumoVenda({
                  empresa: chave.Empresa,
                  obra: chave.Obra,
                  num_ven: chave.Venda,
                }),
                this.saleService.buscarParcelasAReceber({
                  empresa: chave.Empresa,
                  obra: chave.Obra,
                  num_ven: chave.Venda,
                }),
              ]);

              if (!resumo) {
                Console({ type: "warn", message: `Nenhum resumo para ${chave.Obra}/${chave.Venda}` });
                errorCount++;
                return;
              }

              // Persiste inline — não acumula em array antes de salvar
              await this.formatSaleAndSave({ resumo, parcelas });
              saved++;

            } catch (error) {
              errorCount++;
              const message = error instanceof Error ? error.message : `Erro ao processar ${chave.Obra}/${chave.Venda}`;
              Console({ type: "error", message });
            }
          })
        );

        await new Promise((resolve) => setTimeout(resolve, 1000)); // respiro para a API UAU
      }

      console.timeEnd("⏳ tempo total processamento ⏳");

      Console({
        type: "success",
        message: `Sincronismo de vendas finalizado: ${saved} salvas, ${errorCount} falhas.`,
      });

      console.timeEnd("⏳ tempo total worker vendas ⏳");

    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha crítica no Worker de Sincronismo de Vendas.";
      Console({ type: "error", message: "Falha crítica no Worker de Sincronismo de Vendas." });
      Console({ type: "error", message });
      throw error;
    }
  }

  private async formatSaleAndSave({ resumo, parcelas }: SaleSnapshot) {
    const obra = resumo.codigoObra;
    const numVen = resumo.numeroVenda;

    fs.mkdirSync(SALES_SAMPLES_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(SALES_SAMPLES_DIR, `${obra}-${numVen}.json`),
      JSON.stringify({ resumo, parcelas }, null, 2)
    );
  }
}
