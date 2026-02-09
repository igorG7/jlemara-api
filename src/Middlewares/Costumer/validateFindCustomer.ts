import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

export const validateFindCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const keys = Object.keys(req.body);

  if (keys.length === 0) {
    Console({ type: "error", message: "Nenhum parâmetro de busca informado." });
    return res
      .status(400)
      .json({ message: "Nenhum parâmetro de busca informado.", error: null });
  }
  if (keys.length > 1) {
    Console({ type: "error", message: "Informe apenas uma chave para busca." });

    return res
      .status(400)
      .json({ message: "Informe apenas uma chave para busca.", error: null });
  }

  const key = keys[0];
  const value = req.body[key];

  const validKeys = [
    "code_person",
    "cpf_person",
    "email",
    "phone_numbers",
    "id",
    "_id",
    "cnpj_person",
  ];

  if (!validKeys.includes(key)) {
    Console({
      type: "error",
      message: `Chave '${key}' não permitida para busca.`,
    });

    return res.status(400).json({
      message: `Chave '${key}' não permitida para busca.`,
      error: null,
    });
  }

  req.body = { [key]: value };

  if (key === "id" || key === "_id") {
    req.body = { _id: value };
  }

  if (!value) {
    Console({
      type: "error",
      message: `A chave '${key}' não pode estar vazia.`,
    });

    return res
      .status(400)
      .json({ message: `A chave '${key}' não pode estar vazia.`, error: null });
  }

  next();
};
