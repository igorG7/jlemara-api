import { Request, Response, NextFunction } from "express";

import { AuthBody } from "Controllers/user.controller";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar as credenciais de acesso de um usuário.
 *
 * Regras de validação:
 * - Os campos 'email' e 'password' devem ser informados para autenticação.
 *
 * Comportamento:
 * - Retorna HTTP 401 se 'email' ou 'password' não forem fornecidos.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 401 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const hasUserData = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password }: AuthBody = req.body;

  if (!email || !password) {
    Console({ type: "error", message: "Forneça as credenciais corretamente." });
    return res
      .status(401)
      .json({ message: "Forneça as credenciais corretamente.", error: null });
  }

  next();
};
