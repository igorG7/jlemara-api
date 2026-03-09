import { Request, Response } from "express";

import Console from "../utils/Console";
import Development from "./infra/development";

class DevelopmentController {
  async createTemp(req: Request, res: Response) {
    try {
      const body = req.body;

      const development = await Development.create(body);

      return res.status(201).json({ message: "Obra criada.", data: development });
    } catch (error) {
      return res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }

  async listAll(req: Request, res: Response) {
    try {
      const page = Number(req.params.page) || 1;
      const number = Number(req.params.number) || 10;

      Console({ type: "log", message: "Buscando obras." });

      const [developments, total] = await Promise.all([
        Development.find(
          {},
          {},
          { limit: number, skip: (page - 1) * number },
        ).lean(),
        Development.countDocuments(),
      ]);

      if (!developments.length) {
        Console({ type: "warn", message: "Nenhuma obra encontrada." });
        return res.status(404).json({
          message: "Nenhuma obra encontrada.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca por obras concluída." });

      return res.status(200).json({
        message: "Busca por obras concluída.",
        data: developments,
        pagination: { total, page, limit: number, pages: Math.ceil(total / number) },
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }

  async findDevelopment(req: Request, res: Response) {
    try {
      const query = req.body;

      Console({ type: "log", message: "Buscando obra." });

      const development = await Development.findOne(query).lean();

      if (!development) {
        Console({ type: "error", message: "Obra não encontrada." });
        return res.status(404).json({ message: "Obra não encontrada.", error: null });
      }

      Console({ type: "success", message: "Busca por obra concluída." });

      return res.status(200).json({
        message: "Busca por obra concluída.",
        data: development,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }

  async listPublics(req: Request, res: Response) {
    try {
      const page = Number(req.params.page) || 1;
      const number = Number(req.params.number) || 10;

      Console({ type: "log", message: "Buscando obras públicas." });

      const [developments, total] = await Promise.all([
        Development.find(
          { is_public: true },
          {},
          { limit: number, skip: (page - 1) * number },
        ).lean(),
        Development.countDocuments({ is_public: true }),
      ]);

      if (!developments.length) {
        Console({ type: "warn", message: "Nenhuma obra pública encontrada." });
        return res.status(404).json({
          message: "Nenhuma obra pública encontrada.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca por obras públicas concluída." });

      return res.status(200).json({
        message: "Busca por obras públicas concluída.",
        data: developments,
        pagination: { total, page, limit: number, pages: Math.ceil(total / number) },
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res.status(500).json({ message: "Erro interno inesperado.", error });
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
        return res.status(404).json({ message: "Obra não encontrada.", error: null });
      }

      Console({ type: "success", message: "Obra atualizada com sucesso." });

      return res.status(200).json({
        message: "Obra atualizada com sucesso.",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }

  async updateAddress(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      Console({ type: "log", message: "Atualizando endereço da obra." });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        { $set: body, updatedAt: new Date() },
        { new: true },
      );

      if (!updatedDevelopment) {
        Console({ type: "warn", message: "Obra não encontrada." });
        return res.status(404).json({ message: "Obra não encontrada.", error: null });
      }

      Console({ type: "success", message: "Endereço atualizado com sucesso." });

      return res.status(200).json({
        message: "Endereço atualizado com sucesso.",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }

  async updateInfrastructure(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      Console({ type: "log", message: "Atualizando infraestrutura da obra." });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        { $set: { infrastructure: body }, updatedAt: new Date() },
        { new: true },
      ).lean();

      if (!updatedDevelopment) {
        Console({ type: "warn", message: "Obra não encontrada." });
        return res.status(404).json({
          message: "Obra não encontrada.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Infraestrutura atualizada com sucesso!" });

      return res.status(200).json({
        message: "Infraestrutura atualizada com sucesso!",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }

  async updateInfosSite(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      Console({ type: "log", message: "Atualizando informações de site da obra..." });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        { $set: { infos_site: body }, updatedAt: new Date() },
        { new: true },
      ).lean();

      if (!updatedDevelopment) {
        Console({ type: "error", message: "Obra não encontrada." });
        return res.status(404).json({ message: "Obra não encontrada.", error: null });
      }

      Console({ type: "success", message: "Informações de site atualizadas com sucesso!" });

      return res.status(200).json({
        message: "Informações de site atualizadas com sucesso!",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }

  async addPhoto(req: Request, res: Response) {
    try {
      const { id, photos } = req.body;

      Console({ type: "log", message: "Adicionando fotos na obra." });

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        { $addToSet: { photos: { $each: photos } }, updatedAt: new Date() },
        { new: true, runValidators: true },
      ).lean();

      if (!updatedDevelopment) {
        Console({ type: "error", message: "Obra não encontrada para adicionar fotos." });
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
      return res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }

  async removePhoto(req: Request, res: Response) {
    try {
      const { id, public_id } = req.body;

      const updatedDevelopment = await Development.findByIdAndUpdate(
        id,
        { $pull: { photos: { public_id: public_id } }, updatedAt: new Date() },
        { new: true },
      );

      if (!updatedDevelopment) {
        Console({ type: "warn", message: "Obra não encontrada." });
        return res.status(404).json({ message: "Obra não encontrada.", error: null });
      }

      Console({ type: "success", message: "Foto removida com sucesso!" });

      return res.status(200).json({
        message: "Foto removida com sucesso!",
        data: updatedDevelopment,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }
}

export default new DevelopmentController();
