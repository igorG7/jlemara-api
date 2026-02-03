import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar se o 'userID' foi fornecido no corpo da requisição.
 *
 * Regras de validação:
 * - O campo 'userID' deve ser informado no envio da requisição.
 *
 * Comportamento:
 * - Retorna HTTP 400 se 'userID' não for informado.
 *
 *@param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateReadPending = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userID }: { userID: string } = req.body;

  if (!userID) {
    Console({ type: "error", message: "Id de usuário não fornecido." });
    return res
      .status(400)
      .json({ message: "Id de usuário não fornecido.", error: null });
  }
  next();
};
