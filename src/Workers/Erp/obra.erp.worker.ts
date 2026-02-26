import Console, { ConsoleData } from "../../Lib/Console";
import Erp from "../../Services/Erp";
import { ResponseFindDevelopmentByCode } from "../../Services/Erp/Development/erp.development.types";

export default class DevelopmentErpWorker {

    private developmentErp = Erp.development
    private isRunning = false

    async start() {
        if (this.isRunning) return
        try {
            this.isRunning = true
            await this.rescueErpObras()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Problemas na inicialização do worker etl obras"
            Console({ type: "error", message });
            ConsoleData({ type: "error", data: error })
        } finally {
            this.isRunning = false
        }
    }

    private async rescueErpObras() {
        console.time("⏳ tempo total worker ⏳");
        Console({ type: "log", message: "Iniciando verificação em lote de obras no ERP UAU." });

        try {
            // --- CONFIGURAÇÃO DE LOTE (CHUNKS) ---
            const CHUNK_SIZE = 100 // Processa CHUNK_SIZE obras por vez em paralelo

            console.time("⏳ tempo total busca no erp ⏳");

            const obrasErp = await this.developmentErp.findAllDevelopments()
            if (!obrasErp) throw new Error("Nenhuma obra encontrada no ERP UAU.")
            const totalItems = obrasErp.length
            let qtdObrasErpCompletas = 0
            let qtdErroDeBusca = 0

            Console({ type: "log", message: `${totalItems} obras identificadas no ERP UAU.` });

            const obrasInfoCompleta: ResponseFindDevelopmentByCode[] = []

            const dataToProcess = obrasErp.slice(0, 100) // utilizado para testes com um .slice(x, y)

            for (let i = 0; i < dataToProcess.length; i += CHUNK_SIZE) {

                const chunk = dataToProcess.slice(i, i + CHUNK_SIZE)

                Console({ type: "log", message: `Processando lote: ${i} até ${Math.min(i + CHUNK_SIZE, totalItems)} de ${totalItems}...` })

                await Promise.all(
                    chunk.map(async (obra) => {
                        try {
                            if (!obra.Cod_obr) {
                                qtdErroDeBusca++
                                return
                            }

                            const findCompleteData = await this.developmentErp.findDevelopmentByCode(1, obra.Cod_obr)

                            if (!findCompleteData) {
                                qtdErroDeBusca++
                                return
                            }

                            obrasInfoCompleta.push(findCompleteData)
                            qtdObrasErpCompletas++
                        } catch (error) {
                            qtdErroDeBusca++
                            const message = error instanceof Error ? error.message : `Problemas no processamento da obra ${obra.Cod_obr}`
                            Console({ type: "error", message })
                        }
                    })
                )

                await new Promise(resolve => setTimeout(resolve, 1000)) // respiro para a API UAU de 1s
            }

            console.timeEnd("⏳ tempo total busca no erp ⏳");

            Console({
                type: "log", message: `
                Foram encontradas ${totalItems} obras no ERP. Detalhadas resgatadas: ${qtdObrasErpCompletas}. Falhas: ${qtdErroDeBusca}.
                Iniciando persistência no DB ...
                `
            })

            console.time("⏳ tempo total persistencia no backend ⏳");

            /* ============================================================
             * TRECHO PARA PERSISTÊNCIA -> IgorG7
             *
             * Dado disponível: obrasInfoCompleta (ResponseFindObraWithCode[])
             * Quantidade:      obrasInfoCompleta.length registros prontos para upsert
             * Referência tipo: src/Services/Uau/Obra/uau.obra.types.ts
             * ============================================================ */

            console.timeEnd("⏳ tempo total persistencia no backend ⏳");

            Console({ type: "success", message: `Sincronismo finalizado: ${qtdObrasErpCompletas} resgatadas, ${qtdErroDeBusca} falhas.` })
            console.timeEnd("⏳ tempo total worker ⏳");

        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha crítica no Worker de Sincronismo de Obras."
            Console({ type: "error", message })
            throw error
        }
    }
}
