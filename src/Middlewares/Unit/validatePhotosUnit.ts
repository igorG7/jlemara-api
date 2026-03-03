import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar as chaves enviadas na atualização de fotos de uma unidade.
 * Regras de validação:
 * - O corpo da requisição deve conter obrigatóriamente a chave 'id'.
 * - Uma lista 'photos' deve ser fornecida contendo as fotos.
 * - As chaves para atualização devem ser correspondentes as previamente definidas em 'validKeys'.
 * - As chaves necessárias para atualização não podem estar sem valor.
 *
 * Comportamento:
 * - Retorna HTTP 400 se `id` não for informado ou não tiver valor.
 * - Retorna HTTP 400 se nenhuma informação em 'photos' for enviada para atualização.
 * - Retorna HTTP 400 se alguma chave não corresponder a lista 'validKeys.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validatePhotoUnit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, photos } = req.body;

  if (!id) {
    Console({ type: "error", message: "ID da unidade não informado." });

    return res.status(400).json({
      message: "ID da unidade não informado.",
      error: null,
    });
  }

  if (!Array.isArray(photos) || !photos.length) {
    Console({ type: "error", message: "Nenhuma foto válida enviada." });

    return res.status(400).json({
      message: "Nenhuma foto válida enviada.",
      error: null,
    });
  }

  const validKeys = ["url", "caption", "visibility", "public_id"];

  for (const key in photos) {
    const photo = photos[key];

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
  }

  next();
};
