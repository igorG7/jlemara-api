import Unit from "../../modules/unit/unit.controller";
import Console, { ConsoleData } from "../../modules/utils/Console";
import UauUnidadeService from "../../modules/unit/integration/unit.integration";
import { UnitDTO } from "modules/unit/dto/unit.format";


export default class UnitWorker {
  private isRunning = false;
  private unitUauService = new UauUnidadeService();

  async start() {
    if (this.isRunning) return;

    try {
      this.isRunning = true;
      await this.rescueErpUnit();
      this.isRunning = false;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Problemas na inicialização do Worker ETL.";

      Console({ type: "error", message });
      ConsoleData({ type: "error", data: error });
    }
  }

  private async rescueErpUnit() {
    console.time("⏳ tempo total worker ⏳");
    Console({
      type: "log",
      message: "Iniciando verificação em lote de unidades no ERP UAU.",
    });
    try {
      const CHUNK_SIZE = 50; // Processa CHUNK_SIZE obras por vez em paralelo

      console.time("⏳ tempo total busca no erp ⏳");

      const units = await this.unitUauService.findAllUnidades();

      const total = units.length;
      let success = 0;
      let failure = 0;

      Console({
        type: "log",
        message: `${total} unidades identificadas no ERP UAU.`,
      });

      console.timeEnd("⏳ tempo total busca no erp ⏳");

      console.time("⏳ tempo total de cadastro no banco ⏳");

      const dataToProcess = units; // utilizado para testes com um .slice(x, y)

      for (let i = 0; i < dataToProcess.length; i += CHUNK_SIZE) {
        const chunk = dataToProcess.slice(i, i + CHUNK_SIZE);

        Console({
          type: "log",
          message: `Processando lote: ${i} até ${Math.min(i + CHUNK_SIZE, total)} de ${total}...`,
        });

        await Promise.all(
          chunk.map(async (unit) => {
            try {
              if (
                (!unit.C1_unid && !unit.C2_unid) ||
                !unit.Identificador_unid
              ) {
                Console({
                  type: "error",
                  message: "Identificadores de unidade não informados",
                });
                failure++;
                return;
              }

              const unitFormated = UnitDTO.format(unit);
              await Unit.registerUnit(unitFormated);

              success++;
            } catch (error) {
              failure++;
              const message =
                error instanceof Error
                  ? error.message
                  : `Problemas no processamento da unidade ${unit.Identificador_unid}`;
              Console({ type: "error", message });
            }
          }),
        );

        await new Promise((resolve) => setTimeout(resolve, 1000)); // respiro para a API UAU de 1s
      }

      console.timeEnd("⏳ tempo total de cadastro no banco ⏳");

      Console({
        type: "log",
        message: `Foram encontradas ${total} unidades no ERP. Detalhadas resgatadas: ${success}. Falhas: ${failure}. Iniciando persistência no DB ...`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Problemas no processamento worker uau customer ";

      Console({
        type: "error",
        message: "Falha crítica no Worker de Sincronismo.",
      });

      Console({ type: "error", message });
    }
  }
}
