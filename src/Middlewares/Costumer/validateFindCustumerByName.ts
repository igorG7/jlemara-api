import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";
import { error } from "console";

/**
 * Middleware responsável por validar a chave enviada na busca de clientes.
 * Regras de validação:
 * - O campo `name` é obrigatório e deve estar presente no corpo da requisição.
 *
 * Comportamento:
 * - Retorna HTTP 400 se o 'name' não for informado.
 * - Retorna HTTP 400 se nenhuma informação de busca for enviada.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateFindCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name } = req.body;

  if (!name) {
    Console({ type: "error", message: "Nenhum nome foi fornecido." });
    return res
      .status(400)
      .json({ message: "Nenhum nome foi fornecido.", error: null, data: [] });
  }

  next();
};
