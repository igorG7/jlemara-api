// src/Services/Uau/Sale/uau.sale.service.ts
// Branch: feat/uau-venda-integration-test
//
// Serviço de auditoria — consome endpoints da seção Venda da UAU API
// para entender a estrutura real dos dados antes da modelagem definitiva.
// Responses capturadas em: src/Services/Uau/Sale/samples/
// Ver: VENDA_STUDY.md na raiz do projeto.

import path from "path";
import fs from "fs";
import Console from "../../../Lib/Console";
import uau from "../../../Lib/Uau";
import {
  RetornaChavesVendasRequest,
  RetornaChavesVendasResponse,
  ExportarVendasXmlResponse,
  ExportarVendasXmlResponseVenda,
  ConsultarResumoVendaRequest,
  ResumoVenda,
  ConsultarParcelasDaVendaRequest,
  ParcelaDaVenda,
  ParcelaDaVendaPayload,
  BuscarParcelasAReceberRequest,
  ParcelaAReceber,
  ConsultarUnidadesCompradasRequest,
  UnidadeComprada,
  ChaveVenda,
} from "./uau.sale.types";

const SAMPLES_DIR = path.resolve(__dirname, "samples");

function saveSample(filename: string, data: unknown): void {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(SAMPLES_DIR, filename),
    JSON.stringify(data, null, 2)
  );
}

export default class UauSaleService {

  private api = uau;

  // ─── RetornaChavesVendasPorPeriodo ─────────────────────────────────────────
  // Retorna as chaves de todas as vendas no período informado.
  // Ponto de entrada natural para o ETL — equivalente ao findCustomersWithSale.
  // Response: string no formato "01-R001/00001,01-R001/00002,..."
  async retornaChavesVendas(dataInicio: string, dataFim: string, statusVenda: string): Promise<RetornaChavesVendasResponse> {
    try {
      const path = "Venda/RetornaChavesVendasPorPeriodo";

      const body: RetornaChavesVendasRequest = {
        data_inicio: dataInicio,
        data_fim: dataFim,
        status_escrituracao: false,
        statusVenda,
        listaEmpresaObra: []
      }

      const data = await this.api.post(path, body) as RetornaChavesVendasResponse;

      Console({ type: "success", message: `UAU: Chaves de vendas retornadas com sucesso.` });

      return data;

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Erro desconhecido";
      Console({ type: "error", message: `retornaChavesVendas: ${message}` });
      throw new Error(message);
    }
  }

  // ─── Utilitário: parseia string de chaves → array de ChaveVenda ────────────
  // Formato de entrada: "01-R001/00001,01-R001/00002"
  parseChavesVendas(raw: string): ChaveVenda[] {
    if (!raw) return [];

    return raw.split(",").map((chave) => {
      // Formato: "EE-OOOO/VVVVV" → ex: "01-R001/00159"
      const [empresaObra, venda] = chave.trim().split("/");
      const [empresa, obra] = empresaObra.split("-");

      return {
        Empresa: Number(empresa),
        Obra: obra,
        Venda: Number(venda),
      };
    });
  }

  // ─── ExportarVendasXml ─────────────────────────────────────────────────────
  // Retorna dados completos de uma ou mais vendas.
  // Salva sample em samples/exportarVendasXml.json
  async exportarVendasXml(dataInicio: string, dataFim: string): Promise<ExportarVendasXmlResponseVenda[]> {
    try {
      Console({ type: "log", message: `UAU: Exportando vendas de ${dataInicio} a ${dataFim}` });

      const body = {
        dados_vendas: {
          dataInicio,
          dataFim,
          statusEscrituracao: false,
          listaVendas: [],
        },
      };

      const data = await this.api.post("Venda/ExportarVendasXml", body) as ExportarVendasXmlResponse;
      const vendas = data?.Vendas?.Venda ?? [];

      saveSample("exportarVendasXml.json", data);
      Console({ type: "success", message: `UAU: Exportação de vendas realizada — ${vendas.length} venda(s).` });

      return vendas;

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Erro desconhecido";
      Console({ type: "error", message: `exportarVendasXml: ${message}` });
      throw new Error(message);
    }
  }

  // ─── ConsultarResumoVenda ──────────────────────────────────────────────────
  // Resumo financeiro de uma venda: totais pagos, a pagar, parcelas, desconto.
  // Salva sample em samples/consultarResumoVenda.json
  async consultarResumoVenda({ empresa, obra, num_ven, data_calculo, data_correcao }: ConsultarResumoVendaRequest): Promise<ResumoVenda> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const body = {
        codigoEmpresa: empresa,
        codigoObra: obra,
        numeroVenda: num_ven,
        dataCalculo: data_calculo ?? today,
        dataCorrecao: data_correcao ?? today,
        antecipar: false,
        parcelas: [],
        aplicarDescontoGeral: false,
        percentualDescontoGeral: 0,
        aplicarDescontoAntecipacao: false,
      };

      const data = await this.api.post("Venda/ConsultarResumoVenda", body) as ResumoVenda;

      saveSample("consultarResumoVenda.json", data);
      Console({ type: "success", message: `UAU: Resumo da venda ${empresa}-${obra}/${num_ven} consultado.` });

      return data;

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Erro desconhecido";
      Console({ type: "error", message: `consultarResumoVenda: ${message}` });
      throw new Error(message);
    }
  }

  // ─── ConsultarParcelasDaVenda ──────────────────────────────────────────────
  // Lista parcelas de uma venda com cálculo de juros e antecipação.
  // Salva sample em samples/consultarParcelasDaVenda.json
  //
  // NOTA: quando não há boletos gerados para a venda, o MyTable retorna apenas
  // metadados de schema .NET (nomes de tipo). Usar venda com boletos gerados.
  async consultarParcelasDaVenda(params: ConsultarParcelasDaVendaRequest): Promise<ParcelaDaVenda[]> {
    try {
      const body: ConsultarParcelasDaVendaRequest = {
        ...params,
        boleto_antecipado: params.boleto_antecipado ?? false,
        data_calculo: params.data_calculo ?? new Date().toISOString().split("T")[0],
      };

      const payload = await this.api.post("Venda/ConsultarParcelasDaVenda", body) as ParcelaDaVendaPayload[];
      const parcelas = payload[0]?.MyTable ?? [];

      saveSample("consultarParcelasDaVenda.json", payload);
      Console({ type: "success", message: `UAU: Parcelas da venda ${params.empresa}-${params.obra}/${params.num_venda} consultadas — ${parcelas.length} parcela(s).` });

      return parcelas;

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Erro desconhecido";
      Console({ type: "error", message: `consultarParcelasDaVenda: ${message}` });
      throw new Error(message);
    }
  }

  // ─── BuscarParcelasAReceber ────────────────────────────────────────────────
  // Parcelas em aberto (a receber) com valores calculados na data de consulta.
  // ✅ Auditado — padrão idêntico ao ConsultarParcelasDaVenda:
  //   elemento [0] é metadado de schema .NET; dados reais começam em [1].
  //   Fix aplicado: raw.slice(1) descarta o header de schema.
  async buscarParcelasAReceber(params: BuscarParcelasAReceberRequest): Promise<ParcelaAReceber[]> {
    try {
      const body: BuscarParcelasAReceberRequest = {
        valor_presente: false,
        data_calculo: new Date().toISOString().split("T")[0],
        ...params,
      };

      const raw = await this.api.post("Venda/BuscarParcelasAReceber", body) as ParcelaAReceber[];

      // elemento [0] é metadado de schema .NET — descarta antes de salvar sample e retornar
      const parcelas = raw.slice(1);

      saveSample("buscarParcelasAReceber.json", parcelas);
      Console({ type: "success", message: `UAU: Parcelas a receber ${params.empresa}-${params.obra}/${params.num_ven} — ${parcelas.length} parcela(s).` });

      return parcelas;

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Erro desconhecido";
      Console({ type: "error", message: `buscarParcelasAReceber: ${message}` });
      throw new Error(message);
    }
  }

  // ─── ConsultarUnidadesCompradasPorCPFCNPJ ─────────────────────────────────
  // Cross-reference completo: dado um CPF/CNPJ retorna todas as unidades
  // compradas com seus dados de venda vinculados (Empresa, Obra, Venda, Status...).
  // Equivalente a uma visão consolidada do cliente no produto.
  // Salva sample em samples/consultarUnidadesCompradas.json
  async consultarUnidadesCompradasPorCPFCNPJ({ CpfCnpj }: ConsultarUnidadesCompradasRequest): Promise<UnidadeComprada[]> {
    try {
      if (!CpfCnpj) throw new Error("CpfCnpj é obrigatório.");

      const data = await this.api.post("Venda/ConsultarUnidadesCompradasPorCPF", { CpfCnpj }) as UnidadeComprada[];

      saveSample("consultarUnidadesCompradas.json", data);
      Console({ type: "success", message: `UAU: Unidades compradas por CPF/CNPJ ${CpfCnpj} — ${data.length} unidade(s).` });

      return data;

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Erro desconhecido";
      Console({ type: "error", message: `consultarUnidadesCompradasPorCPFCNPJ: ${message}` });
      throw new Error(message);
    }
  }

}
