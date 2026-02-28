import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar as chaves enviadas na atualização de fotos de uma unidade.
 * Regras de validação:
 * - O corpo da requisição deve conter obrigatóriamente a chave 'id'.
 * - O corpo da requisição deve conter obrigatóriamente a chave 'photo'.
 * - As chaves de 'photo' devem ser as mesmas contidas em 'validKeys'.
 * - As chaves necessárias para atualização não podem estar sem valor.
 *
 * Comportamento:
 * - Retorna HTTP 400 se `id` não for informado ou não tiver valor.
 * - Retorna HTTP 400 se `photo` não for informado ou não tiver valor.
 * - Retorna HTTP 400 se as chaves de 'photo' não corresponderem as de 'validKeys'.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateUpdatePhoto = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, photo } = req.body;

  if (!id) {
    Console({ type: "error", message: "ID da unidade não informado." });

    return res.status(400).json({
      message: "ID da obra não informado.",
      error: null,
    });
  }

  if (!photo) {
    Console({
      type: "error",
      message: "Nenhuma informação para atualização de foto fornecida.",
    });

    return res.status(400).json({
      message: "Nenhuma informação para atualização de foto fornecida.",
      error: null,
    });
  }

  const validKeys = ["url", "caption", "visibility", "public_id"];

  for (const key in photo) {
    if (!validKeys.includes(key)) {
      Console({
        type: "error",
        message: `Chave '${key}' inválida para atualização.`,
      });

      return res.status(400).json({
        message: `Chave '${key}' inválida para atualização.`,
        error: null,
      });
    }
  }

  next();
};
