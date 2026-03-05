import { Request, Response } from "express";

import { IDevelopment } from "./domain/development.interface";
import Console, { ConsoleData } from "../utils/Console";
import Development from "./infra/development";

class DevelopmentController {
  async createTemp(req: Request, res: Response) {
    try {
      const body = req.body;

      const development = await Development.create(body);

      return res.status(201).json({ data: development });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async registerDevelopment(data: IDevelopment) {
    try {
      const { development_code, address, ...body } = data;

      Console({
        type: "log",
        message: `Cadastrando/atualizando obra ${development_code}.`,
      });

      const development = await Development.findOneAndUpdate(
        { development_code },
        {
          $set: { ...body, ...address, updatedAt: new Date() },
        },
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

  async registerManyDevelopment(data: any[]) {
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

          //ConsoleData({ type: "error", data: error });
          failure++;
        }
      }

      const message = `Total de obras sincronizadas: ${success} de ${total}. Falhas: ${failure}.`;
      Console({ type: "success", message });

      return { status: 200, message, data: { total, success, failure } };
    } catch (error) {
      Console({
        type: "error",
        message: "Erro ao sincronizar obras.",
      });
      //ConsoleData({ type: "error", data: error });
      return {
        status: 500,
        message: "Erro ao sincronizar obras.",
        error: null,
      };
    }
  }

  async listAll(req: Request, res: Response) {
    try {
      const page = Number(req.params.page) || 1;
      const number = Number(req.params.number) || 10;

      Console({ type: "log", message: "Buscando obras." });

      const developments = await Development.find(
        {},
        {},
        { limit: number, skip: (page - 1) * number },
      ).lean();

      if (!developments.length) {
        Console({ type: "warn", message: "Nenhuma obra encontrada." });
        return res
          .status(404)
          .json({ message: "Nenhuma obra encontrada.", error: null, data: [] });
      }

      Console({ type: "success", message: "Busca por obras concluída." });

      return res
        .status(200)
        .json({ message: "Busca por obras concluída.", data: developments });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async findDevelopment(req: Request, res: Response) {
    try {
      const query = req.body;

      Console({ type: "log", message: "Buscando obra." });

      const development = await Development.findOne(query).lean();

      if (!development) {
        Console({ type: "error", message: "Obra não encontrada." });
        return res
          .status(404)
          .json({ message: "Obra não encotrada.", error: null });
      }

      Console({ type: "success", message: "Busca por obra concluída." });

      return res
        .status(200)
        .json({ message: "Busca por obra concluída.", data: development });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async listPublics(req: Request, res: Response) {
    try {
      const page = Number(req.params.page) || 1;
      const number = Number(req.params.number) || 10;

      Console({ type: "log", message: "Buscando obras públicas." });

      const developments = await Development.find(
        { is_public: true },
        {},
        { limit: number, skip: (page - 1) * number },
      ).lean();

      if (!developments.length) {
        Console({ type: "warn", message: "Nenhuma obra pública encontrada." });

        return res.status(404).json({
          message: "Nenhuma obra pública encontrada.",
          error: null,
          data: [],
        });
      }

      Console({
        type: "success",
        message: "Busca por obras públicas concluída.",
      });

      return res.status(200).json({
        message: "Busca por obras públicas concluída.",
        data: developments,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async updateDevelopment(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      Console({ type: "log", message: "Atualizando obra." });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        { ...body },
        { new: true },
      );

      if (!updatedDevelopment) {
        Console({ type: "warn", message: "Obra não encontrada." });

        return res
          .status(404)
          .json({ message: "Obra não encontrada.", error: null });
      }

      Console({ type: "success", message: "Obra atualizada com sucesso." });

      return res.status(200).json({
        message: "Obra atualizada com sucesso.",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async updateAddress(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      Console({ type: "log", message: "Atualizando obra." });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        {
          $set: body,
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!updatedDevelopment) {
        Console({ type: "warn", message: "Obra não encontrada." });

        return res
          .status(404)
          .json({ message: "Obra não encontrada.", error: null });
      }

      Console({ type: "success", message: "Obra atualizada com sucesso." });

      return res.status(200).json({
        message: "Obra atualizada com sucesso.",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async updateInfrastructure(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      Console({
        type: "log",
        message: "Atualizando infraestrutura da obra.",
      });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        {
          $set: { infrastructure: body },
          updatedAt: new Date(),
        },
        { new: true },
      ).lean();

      if (!updatedDevelopment) {
        Console({ type: "warn", message: "Obra não encontrada." });

        return res
          .status(404)
          .json({ message: "Obra não encontrada.", error: null, data: [] });
      }

      Console({
        type: "success",
        message: "Infraestrutura atualizada com sucesso!",
      });

      return res.status(200).json({
        message: "Infraestrutura atualizada com sucesso!",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async updateInfosSite(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      Console({
        type: "log",
        message: "Atualizando informações de site da obra...",
      });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        {
          $set: { infos_site: body },
          updatedAt: new Date(),
        },
        { new: true },
      ).lean();

      if (!updatedDevelopment) {
        Console({
          type: "error",
          message: "Obra não encontrada.",
        });

        return res.status(404).json({
          message: "Obra não encontrada.",
          error: null,
        });
      }

      Console({
        type: "success",
        message: "Informações de site atualizadas com sucesso!",
      });

      return res.status(200).json({
        message: "Informações de site atualizadas com sucesso!",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }

  async addPhoto(req: Request, res: Response) {
    try {
      const { id, photos } = req.body;

      Console({
        type: "log",
        message: "Adicionando fotos na obra.",
      });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        { $addToSet: { photos: { $each: photos } }, updatedAt: new Date() },
        { new: true, runValidators: true },
      ).lean();

      if (!updatedDevelopment) {
        Console({
          type: "error",
          message: "Obra não encontrada para adicionar fotos.",
        });

        return res.status(404).json({
          message: "Obra não encontrada para adicionar fotos.",
          error: null,
        });
      }

      Console({ type: "success", message: "Fotos adicionadas com sucesso!" });

      return res.status(200).json({
        message: "Fotos adicionadas com sucesso!",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }

  async removePhoto(req: Request, res: Response) {
    try {
      const { id, public_id } = req.body;

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        {
          $pull: { photos: { public_id: public_id } },
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!updatedDevelopment) {
        Console({ type: "warn", message: "Obra não encontrada." });

        return res.status(404).json({
          message: "Obra não encontrada.",
          error: null,
        });
      }

      Console({ type: "success", message: "Foto removida com sucesso!" });

      return res.status(200).json({
        message: "Foto removida com sucesso!",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }
}

export default new DevelopmentController();
