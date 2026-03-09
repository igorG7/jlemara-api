import Console, { ConsoleData } from "../utils/Console";
import { IDevelopment } from "./domain/development.interface";
import Development from "./infra/development";

class DevelopmentService {
  async registerDevelopment(data: IDevelopment) {
    try {
      const { development_code, address, ...body } = data;

      Console({
        type: "log",
        message: `Cadastrando/atualizando obra ${development_code}.`,
      });

      const development = await Development.findOneAndUpdate(
        { development_code },
        { $set: { ...body, ...address, updatedAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();

      Console({
        type: "success",
        message: "Obra cadastrada/atualizada com sucesso!",
      });

      return {
        status: 200,
        message: "Obra cadastrada/atualizada com sucesso!",
        data: development,
      };
    } catch (error) {
      Console({ type: "error", message: "Erro ao cadastrar/atualizar obra." });
      ConsoleData({ type: "error", data: error });

      return {
        status: 500,
        message: "Erro ao cadastrar/atualizar obra.",
        error,
        data: null,
      };
    }
  }

  async registerManyDevelopments(data: IDevelopment[]) {
    try {
      const total = data.length;
      let success = 0;
      let failure = 0;

      Console({
        type: "log",
        message: `Sincronizando lista de obras (${total})...`,
      });

      for (const development of data) {
        const { development_code } = development;

        if (!development_code) {
          Console({
            type: "warn",
            message: "Código de obra inválido, ignorando registro.",
          });
          failure++;
          continue;
        }

        try {
          const result = await this.registerDevelopment(development);

          if (result.status === 500) {
            Console({
              type: "warn",
              message: `Falha ao sincronizar obra ${development_code}: ${result.message}`,
            });
            failure++;
            continue;
          }

          Console({
            type: "success",
            message: `Obra ${development_code} sincronizada com sucesso!`,
          });
          success++;
        } catch (error) {
          Console({
            type: "error",
            message: `Erro ao sincronizar obra ${development_code}.`,
          });
          failure++;
        }
      }

      const message = `Total de obras sincronizadas: ${success} de ${total}. Falhas: ${failure}.`;
      Console({ type: "success", message });

      return { status: 200, message, data: { total, success, failure } };
    } catch (error) {
      Console({ type: "error", message: "Erro ao sincronizar obras." });
      return { status: 500, message: "Erro ao sincronizar obras.", error: null };
    }
  }
}

export default new DevelopmentService();
