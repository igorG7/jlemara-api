import { Request, Response, NextFunction } from "express";

import Console from "../../Lib/Console";

import { PendingUpdateType } from "../../Controllers/pendingIssues.controller";

/**
 * Middleware responsável por validar os dados recebidos para atualização de uma pendência.
 *
 * Regras de validação:
 * - Os campos 'userID' e 'reference', devem ser informados.
 * - Pelo menos um dos dois campos 'status' ou 'notes', devem ser informados para realizar uma atualização.
 * - Se 'status' for informado, seu valor deve corresponder aos valores contidos em 'validStatus'.
 *
 * Comportamento:
 * - Retorna HTTP 400 se, 'userID' e 'reference' não forem fornecidos.
 * - Retorna HTTP 400 se, nenhum dos dois campos 'status' e 'notes' forem informados.
 * - Retorna HTTP 400 se, 'status' não corresponder á nenhum valor em 'validStatus'.
 *
 *@param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateUpdatePending = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userID, reference, status, notes }: PendingUpdateType = req.body;
  const validStatus = ["PENDING", "IN_PROGRESS", "COMPLETED"];

  if ((!userID && !reference) || !userID || !reference) {
    Console({
      type: "error",
      message: "Id de usuário e referência da pendência devem ser informados.",
    });
    return res.status(400).json({
      message: "Id de usuário e referência da pendência devem ser informados.",
      error: null,
    });
  }

  if (!status && !notes) {
    Console({ type: "error", message: "Sem conteúdo para atualizar." });
    return res
      .status(400)
      .json({ message: "Sem conteúdo para atualizar.", error: null });
  }

  if (!validStatus.includes(status)) {
    Console({ type: "error", message: "Status inválido." });
    return res.status(400).json({ message: "Status inválido.", error: null });
  }

  next();
};
