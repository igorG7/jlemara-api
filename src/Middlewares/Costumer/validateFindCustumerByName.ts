import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

export const validateFindCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name } = req.body;

  if (!name) {
    Console({ type: "error", message: "Nenhum nome foi fornecido." });
    return res.status(400).json({ message: "Nenhum nome foi fornecido." });
  }

  next();
};
