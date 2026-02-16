import { Request, Response } from "express";

import Development from "../Models/Development";
import Console from "../Lib/Console";

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
}

export default new DevelopmentController();
