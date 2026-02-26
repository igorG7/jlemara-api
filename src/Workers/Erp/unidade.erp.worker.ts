import Console, { ConsoleData } from "../../Lib/Console";
import { ResponseFindAllObras } from "../../Services/Uau/Obra/uau.obra.types";
import { ResponseFindAllUnidades } from "../../Services/Uau/Unidade/uau.unidade.types";
import UauObraService from "../../Services/Uau/Obra/uau.obra.service";
import Erp from "../../Services/Erp";
import { ResponseFindAllUnits } from "Services/Erp/Unit/erp.unit.types";

export default class UnitErpWorker {

    private unitErp = Erp.unit
    private developmentErp = Erp.development
    private isRunning = false;

    async start() {
        if (this.isRunning) return;
        try {
            this.isRunning = true;
            await this.rescueErpUnidades();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Problemas na inicialização do worker etl unidades";
            Console({ type: "error", message });
            ConsoleData({ type: "error", data: error });
        } finally {
            this.isRunning = false;
        }
    }

    private async rescueErpUnidades() {
        console.time("⏳ tempo total worker ⏳");
        Console({ type: "log", message: "Iniciando verificação em lote de unidades no ERP UAU." });

        try {
            // --- CONFIGURAÇÃO DE LOTE (CHUNKS) ---
            const CHUNK_SIZE = 50; // Processa CHUNK_SIZE obras em paralelo por vez

            console.time("⏳ tempo busca obras ⏳");
            const obrasErp = await this.developmentErp.findAllDevelopments() as ResponseFindAllObras[];
            console.timeEnd("⏳ tempo busca obras ⏳");

            const totalObras = obrasErp.length;
            let qtdObrasProcessadas = 0;
            let qtdErroBuscaObra = 0;

            Console({ type: "log", message: `${totalObras} obras identificadas no ERP UAU. Iniciando busca de unidades por obra...` });

            const todasAsUnidades: ResponseFindAllUnits[] = []

            const dataToProcess = obrasErp.slice(0, 100); // utilizado para testes com um .slice(x, y)

            console.time("⏳ tempo total busca no erp ⏳");

            for (let i = 0; i < dataToProcess.length; i += CHUNK_SIZE) {

                const chunk = dataToProcess.slice(i, i + CHUNK_SIZE);

                Console({ type: "log", message: `Processando lote de obras: ${i} até ${Math.min(i + CHUNK_SIZE, totalObras)} de ${totalObras}...` });

                await Promise.all(
                    chunk.map(async (obra) => {
                        try {
                            if (!obra.Cod_obr) {
                                qtdErroBuscaObra++;
                                return;
                            }

                            const unidades = await this.unitErp.findUnitsByCode(1, obra.Cod_obr) as ResponseFindAllUnits[]

                            todasAsUnidades.push(...unidades)
                            qtdObrasProcessadas++;
                        } catch (error) {
                            qtdErroBuscaObra++;
                            const message = error instanceof Error ? error.message : `Problemas ao buscar unidades da obra ${obra.Cod_obr}`;
                            Console({ type: "error", message });
                        }
                    })
                );

                await new Promise(resolve => setTimeout(resolve, 1000)); // respiro para a API UAU de 1s
            }

            console.timeEnd("⏳ tempo total busca no erp ⏳");

            const totalUnidades = todasAsUnidades.length;

            Console({
                type: "log", message: `
                ${totalObras} obras verificadas. Obras com sucesso: ${qtdObrasProcessadas}. Falhas: ${qtdErroBuscaObra}.
                Total de unidades encontradas: ${totalUnidades}.
                Iniciando persistência no DB ...
                `
            });

            console.time("⏳ tempo total persistencia no backend ⏳");

            /* ============================================================
             * TRECHO PARA PERSISTÊNCIA -> IgorG7
             *
             * Dado disponível: todasAsUnidades (ResponseFindAllUnidades[])
             * Quantidade:      todasAsUnidades.length registros prontos para upsert
             * Chave de upsert: Prod_unid + NumPer_unid (par único por unidade no UAU)
             * Referência tipo: src/Services/Uau/Unidade/uau.unidade.types.ts
             * ============================================================ */

            console.timeEnd("⏳ tempo total persistencia no backend ⏳");

            Console({ type: "success", message: `Sincronismo finalizado: ${qtdObrasProcessadas} obras processadas, ${totalUnidades} unidades encontradas, ${qtdErroBuscaObra} falhas.` });
            console.timeEnd("⏳ tempo total worker ⏳");

        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha crítica no Worker de Sincronismo de Unidades.";
            Console({ type: "error", message: "Falha crítica no Worker de Sincronismo de Unidades." });
            Console({ type: "error", message });
            throw error;
        }
    }
}
