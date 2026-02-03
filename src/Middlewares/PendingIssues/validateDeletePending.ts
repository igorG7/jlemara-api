import { Request, Response, NextFunction } from "express";

import Console from "../../Lib/Console";

import { PendingDeleteType } from "../../Controllers/pendingIssues.controller";

/**
 * Middleware responsável por validar o corpo da requisição para deletar uma pendência.
 *
 * Regras de validação:
 * - 'userID' e 'reference' devem ser informados no corpo da requisição.
 *
 * Comportamento:
 * - Retorna HTTP 400 se algum dos dois campos não for informado.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateDeletePending = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userID, reference }: PendingDeleteType = req.body;

  if (!userID) {
    Console({ type: "error", message: "Id do usuário não fornecido." });
    return res
      .status(400)
      .json({ message: "Id do usuário não fornecido.", error: null });
  }

  if (!reference) {
    Console({
      type: "error",
      message: "Referência de pendência não fornecida.",
    });
    return res.status(400).json({
      message: "Referência de pendência não fornecida.",
      error: null,
    });
  }

  next();
};
