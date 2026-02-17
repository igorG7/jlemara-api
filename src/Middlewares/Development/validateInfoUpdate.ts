import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";
import { error } from "console";

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

export const validateInfoUpdate = (
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
    "title",
    "description",
    "highlights",
    "price_from",
    "average_area_m2",
  ];

  for (const [key, value] of Object.entries(body)) {
    if (!validKeys.includes(key) || !value) {
      Console({
        type: "error",
        message: `Chave '${key}' inválida ou sem valor .`,
      });

      return res.status(400).json({
        message: `Chave '${key}' inválida ou sem valor .`,
        error: null,
      });
    }
  }

  //   for (const [key, value] of Object.entries(body.highlights)) {
  //     if (key.name !== "name" && key !== "description") {
  //       Console({
  //         type: "error",
  //         message: `Chave '${key}' inválida em 'Destaques'.`,
  //       });

  //       return res.status(400).json({
  //         message: `Chave '${key}' inválida em 'Destaques'.`,
  //         error: null,
  //       });
  //     }

  //     if (!value) {
  //       Console({
  //         type: "error",
  //         message: `Chave '${key}' sem valor.`,
  //       });

  //       return res.status(400).json({
  //         message: `Chave '${key}' sem valor.`,
  //         error: null,
  //       });
  //     }
  //   }

  next();
};
