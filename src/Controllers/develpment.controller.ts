import { Request, Response } from "express";

import Development from "../Models/Development";
import Console from "../Lib/Console";
import { error } from "console";

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

  async listAll(req: Request, res: Response) {
    try {
      const page = Number(req.params.page) || 1;

      Console({ type: "log", message: "Buscando obras." });

      const developments = await Development.find(
        {},
        {},
        { limit: 5, skip: (page - 1) * 5 },
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

  async findPublics(req: Request, res: Response) {
    try {
      const page = Number(req.params.page) || 1;

      Console({ type: "log", message: "Buscando obras públicas." });

      const developments = await Development.find(
        { is_public: true },
        {},
        { limit: 5, skip: (page - 1) * 5 },
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

  async updateLocation(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      Console({ type: "log", message: "Atualizando obra." });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        {
          latitude: body.latitude,
          longitude: body.longitude,
          link_maps: body?.link_maps ?? "",
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

        return {
          message: "Obra não encontrada.",
          error: null,
        };
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
}

export default new DevelopmentController();
