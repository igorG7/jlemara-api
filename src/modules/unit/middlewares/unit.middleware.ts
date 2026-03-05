import { Request, Response, NextFunction } from "express";
import Console from "../../utils/Console";

/**
 * Middleware responsável por validar as chaves enviadas na busca de um cliente.
 * Regras de validação:
 * - O corpo da requisição deve conter obrigatóriamente uma chave e apenas uma.
 * - Apenas as chaves previamente definidas em `validKeys` são permitidas para atualização.
 *
 * Comportamento:
 * - Retorna HTTP 400 se `key` não possuir nenhuma chave.
 * - Retorna HTTP 400 se 'key' possuir mais de uma chave.
 * - Retorna HTTP 400 se 'key' conter chaves não permitidas para atualização.
 * - Retorna HTTP 400 se houver alguma chave válida sem valor.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const findUnits = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const keys = Object.keys(req.body);

  if (keys.length === 0) {
    Console({ type: "error", message: "Nenhum parâmetro de busca informado." });
    return res
      .status(400)
      .json({ message: "Nenhum parâmetro de busca informado.", error: null });
  }
  if (keys.length > 1) {
    Console({ type: "error", message: "Informe apenas uma chave para busca." });

    return res
      .status(400)
      .json({ message: "Informe apenas uma chave para busca.", error: null });
  }

  const key = keys[0];
  const value = req.body[key];

  const validKeys = ["development_code", "unit_status"];

  if (!validKeys.includes(key)) {
    Console({
      type: "error",
      message: `Chave '${key}' não permitida para busca.`,
    });

    return res.status(400).json({
      message: `Chave '${key}' não permitida para busca.`,
      error: null,
    });
  }

  req.body = { [key]: value };

  if (key === "id" || key === "_id") {
    req.body = { _id: value };
  }

  if (!value && value !== 0) {
    Console({
      type: "error",
      message: `A chave '${key}' não pode estar vazia.`,
    });

    return res
      .status(400)
      .json({ message: `A chave '${key}' não pode estar vazia.`, error: null });
  }

  next();
};


export const addPhoto = (
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

export const deletePhoto = (
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

export const updatePhoto = (
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

export const unitPhoto = (
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
