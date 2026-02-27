import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar as chaves enviadas na atualização de uma unidade.
 * Regras de validação:
 * - O corpo da requisição deve conter obrigatóriamente as chaves 'id'.
 * - As chaves fornecidas para atualização devem estar presentes na lista 'validKeys'.
 * - As chaves necessárias para atualização não podem estar sem valor.
 *
 * Comportamento:
 * - Retorna HTTP 400 se `id` não for informado ou não tiver valor.
 * - Retorna HTTP 400 se nenhuma informação para atualização for enviada.
 * - Retorna HTTP 400 se as chaves enviadas não corresponderem a lista ‘validKeys’.
 * - Retorna HTTP 400 se as chaves enviadas não tiverem valor.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateUnitUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, ...body } = req.body;

  if (!id) {
    Console({ type: "error", message: "ID da obra não informado." });

    return res.status(400).json({
      message: "ID da obra não informado.",
      error: null,
    });
  }

  if (!body) {
    Console({
      type: "error",
      message: "Nenhuma informação enviada.",
    });

    return res.status(400).json({
      message: "Nenhuma informação enviada.",
      error: null,
    });
  }

  const validKeys = ["latitude", "longitude"];

  for (const [key, value] of Object.entries(body)) {
    if (!validKeys.includes(key) || (!value && typeof value !== "boolean")) {
      Console({
        type: "error",
        message: `Chave '${key}' inválida ou sem valor.`,
      });

      return res.status(400).json({
        message: `Chave '${key}' inválida ou sem valor.`,
        error: null,
      });
    }
  }

  next();
};
