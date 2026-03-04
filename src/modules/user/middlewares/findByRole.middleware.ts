import { Request, Response, NextFunction } from "express";

import { FindUserByRole } from "../user.controller";
import Console from "../../../Lib/Console";

/**
 * Middleware responsável por validar se os dados necessários para busca estão sendo fornecidos.
 *
 * Regras de validação:
 * - Ao menos um dos campos 'id' ou 'email' devem ser fornecidos.
 *
 * Comportamento:
 * - Retorna HTTP 400 se nenhum dos dois campos necessários for fornecido.
 *
 *  @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateFindUsersByRole = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { role }: FindUserByRole = req.body;

  if (!role) {
    Console({
      type: "error",
      message: "A ROLE deve ser informada.",
    });
    return res
      .status(400)
      .json({ message: "A ROLE deve ser informada.", error: null });
  }

  next();
};
