import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar as chaves enviadas na remoção de fotos de uma unidade.
 * Regras de validação:
 * - O corpo da requisição deve conter obrigatóriamente a chave 'id'.
 * - O corpo da requisição deve conter obrigatóriamente a chave 'public_id'.
 * - As chaves necessárias para atualização não podem estar sem valor.
 *
 * Comportamento:
 * - Retorna HTTP 400 se `id` não for informado ou não tiver valor.
 * - Retorna HTTP 400 se `public_id` não for informado ou não tiver valor.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validatePhotoDelete = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, public_id } = req.body;

  if (!id) {
    Console({ type: "error", message: "ID da unidade não informado." });

    return res.status(400).json({
      message: "ID da obra não informado.",
      error: null,
    });
  }

  if (!public_id) {
    Console({
      type: "error",
      message: "Identificador 'public_id' da foto não informado.",
    });

    return res.status(400).json({
      message: "Identificador 'public_id' da foto não informado.",
      error: null,
    });
  }

  next();
};
