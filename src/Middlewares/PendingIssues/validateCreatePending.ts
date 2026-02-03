import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

import { PendingUserIssueType } from "../../Models/PendingIssues";

/**
 * Middleware responsável por validar o corpo da requisição para registrar uma pendência.
 *
 * Regras de validação:
 * - O corpo da requisição deve ser recebido.
 * - O corpo da requisição deve conter todos os campos presentes em 'requiredKeys'.
 * - Os campos presentes no corpo da requisição não podem estar sem valores.
 * - O campo 'status', deve estar presente no corpo da requisição e deve ter seu valor contido na lista 'validStatus'.
 *
 * Comportamento:
 * - Retorna HTTP 400 se, nenhum dado for recebido no corpo da requisição.
 * - Retorna HTTP 400 se, faltar algum campo obrigatório no corpo da requisição.
 * - Retorna HTTP 400 se, algum campo do corpo da requisição estiver sem valor.
 * - Retorna HTTP 400 se, o campo 'status' não apresentar um valor correspondente a lista 'validStatus'.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateCreatePending = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const pendingIssue: PendingUserIssueType = req.body;

  const requiredKeys = [
    "userID",
    "title",
    "description",
    "date",
    "reference",
    "dueDate",
    "status",
    "log",
  ];

  if (!pendingIssue) {
    Console({ type: "error", message: "Pendência não fornecida." });
    return res
      .status(400)
      .json({ message: "Pendência não fornecida.", error: null });
  }

  for (const key of requiredKeys) {
    if (!(key in pendingIssue)) {
      Console({
        type: "error",
        message: `Propriedade '${key}' não fornecido(a).`,
      });

      return res.status(400).json({
        message: `Propriedade '${key}' não fornecido(a).`,
        error: null,
      });
    }
  }

  for (const [key, value] of Object.entries(pendingIssue)) {
    if (!value) {
      Console({
        type: "error",
        message: `Propriedade '${key}' não fornecido(a).`,
      });

      return res.status(400).json({
        message: `Propriedade '${key}' não fornecido(a).`,
        error: null,
      });
    }
  }

  const validStatus = ["PENDING", "IN_PROGRESS", "COMPLETED"];

  if (!validStatus.includes(pendingIssue.status)) {
    Console({ type: "error", message: "Status inválido." });
    return res.status(400).json({ message: "Status inválido.", error: null });
  }

  next();
};
