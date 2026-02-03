import { Request, Response, NextFunction } from "express";

import Console from "../../Lib/Console";
import { UpdatePassBody } from "../../Controllers/user.controller";

/**
 * Middleware responsável por validar os dados recebidos para atualização de um usuário.
 *
 * Regras de validação:
 * - O campo 'id' e 'password' são obrigatórios e devem estar presente no corpo da requisição.
 *
 * Comportamento:
 * - Retorna HTTP 400 se 'id' ou/e 'password' não forem informados.
 * - Caso as validações passem, a requisição segue para o próximo middleware.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateUpdatePass = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, password }: UpdatePassBody = req.body;

  if (!id) {
    Console({ type: "error", message: "Id não informado." });
    return res.status(400).json({ message: "Id não informado.", error: null });
  }

  if (!password) {
    Console({ type: "error", message: "Nova senha não informada." });
    return res
      .status(400)
      .json({ message: "Nova senha não informada.", error: null });
  }
  next();
};
