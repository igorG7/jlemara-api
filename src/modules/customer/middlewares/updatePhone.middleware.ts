import { Request, Response, NextFunction } from "express";
import Console from "../../../Lib/Console";

/**
 * Middleware responsável por validar as chaves enviadas na atualização de um cliente.
 * Regras de validação:
 * - O campo `id` é obrigatório e deve estar presente no corpo da requisição.
 * - O campo `phone_number` é obrigatório e deve estar presente no corpo da requisição.
 *
 * Comportamento:
 * - Retorna HTTP 400 se o `id` não for informado ou não tiver valor.
 * - Retorna HTTP 400 se o `phone_number` não for informado ou não tiver valor.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const updatePhoneCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, phone_number } = req.body;

  if (!id) {
    Console({ type: "error", message: "Id do cliente não informado." });
    return res
      .status(400)
      .json({ message: "Id do cliente não informado.", error: null });
  }

  if (!phone_number) {
    Console({ type: "error", message: "Número de telefone não informado." });
    return res
      .status(400)
      .json({ message: "Número de telefone não informado.", error: null });
  }

  next();
};
