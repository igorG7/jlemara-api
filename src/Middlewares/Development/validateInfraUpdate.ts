import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar as chaves enviadas na atualização de infraestrutura de uma obra.
 * Regras de validação:
 * - O corpo da requisição deve conter obrigatóriamente as chaves 'id'.
 * - As chaves para atualização devem ser correspondentes as previamente definidas em 'validKeys'.
 * - As chaves necessárias para atualização não podem estar sem valor.
 *
 * Comportamento:
 * - Retorna HTTP 400 se `id` não for informado ou não tiver valor.
 * - Retorna HTTP 400 se nenhuma informação for enviada para atualização.
 * - Retorna HTTP 400 se alguma chave não corresponder a lista 'validKeys.
 * - Retorna HTTP 400 se alguma chave não tiver valor ou se conter valor inválido.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateInfraUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, ...body } = req.body;

  if (!id) {
    Console({ type: "error", message: "ID da obra não informado." });

    return res
      .status(400)
      .json({ message: "ID da obra não informado.", error: null });
  }

  if (!body) {
    Console({ type: "error", message: "Nenhuma informação fornecida." });

    return res
      .status(400)
      .json({ message: "Nenhuma informação fornecida.", error: null });
  }

  const validKeys = [
    "water_supply",
    "power_grid",
    "internet",
    "sewage_system",
    "road_paving",
    "public_street_lighting",
    "green_area",
  ];

  for (const [key, value] of Object.entries(body)) {
    if (!validKeys.includes(key) || typeof value !== "boolean") {
      Console({
        type: "error",
        message: `Chave '${key}' inválida ou com valor inválido.`,
      });

      return res.status(400).json({
        message: `Chave '${key}' inválida ou com valor inválido.`,
        error: null,
      });
    }
  }

  next();
};
