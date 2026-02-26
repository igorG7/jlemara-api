import { Request, Response } from "express";

import Unit from "../Models/Unit";
import Console from "../Lib/Console";

class UnitController {
  async createTemp(req: Request, res: Response) {
    try {
      const body = req.body;

      const unit = await Unit.create(body);

      return res.status(200).json({ message: "Criado", data: unit });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async searchAvaliables(req: Request, res: Response) {
    try {
      Console({ type: "log", message: "Buscando unidades disponíveis." });

      const units = await Unit.find({ unit_status: 0 }).lean();

      if (!units.length) {
        Console({ type: "warn", message: "Nenhuma unidade encontrada." });

        return res.status(404).json({
          message: "Nenhuma unidade encontrada.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca concluída com sucesso!" });
      return res.status(200).json({ message: "", data: units });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }
}

export default new UnitController();
