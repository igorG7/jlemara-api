import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar as chaves enviadas na atualização de localização de uma obra.
 * Regras de validação:
 * - O corpo da requisição deve conter obrigatóriamente as chaves 'id', 'latitude' e 'longitude'.
 * - As chaves necessárias para atualização não podem estar sem valor.
 *
 * Comportamento:
 * - Retorna HTTP 400 se `id` não for informado ou não tiver valor.
 * - Retorna HTTP 400 se 'latitude' ou 'longitude' não forem informados ou não tiverem valor.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateAddressUpdate = (
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

  const validKeys = [
    "number",
    "street",
    "district",
    "zip_code",
    "city",
    "longitude",
    "latitude",
  ];

  for (const [key, value] of Object.entries(body)) {
    if (!validKeys.includes(key) || !value) {
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

  let newBody: any = {};

  for (const key in body) {
    newBody[`address.${key}`] = body[key];
  }

  req.body = { id, ...newBody };

  next();
};
