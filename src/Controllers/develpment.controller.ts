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
}

export default new DevelopmentController();
