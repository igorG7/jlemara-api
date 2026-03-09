import { Request, Response, NextFunction } from "express";
import Console from "../../utils/Console";

/**
 * Middleware responsável por validar as chaves enviadas na busca de uma obra.
 * Regras de validação:
 * - O corpo da requisição deve conter obrigatóriamente uma chave e apenas uma.
 * - Apenas as chaves previamente definidas em `validKeys` são permitidas para busca.
 *
 * Comportamento:
 * - Retorna HTTP 400 se `key` não possuir nenhuma chave ou se possuir mais de uma.
 * - Retorna HTTP 400 se 'key' conter chaves não permitidas para busca.
 * - Retorna HTTP 400 se houver alguma chave válida sem valor.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const findDevelopment = (
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

  const validKeys = ["development_code", "id", "_id"];

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

  if (!value) {
    Console({
      type: "error",
      message: `A chave '${key}' não pode estar sem valor.`,
    });

    return res
      .status(400)
      .json({
        message: `A chave '${key}' não pode estar sem valor.`,
        error: null,
      });
  }

  next();
};

export const updateDevelopment = (
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
    "public_name",
    "link_maps",
    "is_public",
    "description",
    "company",
    "status",
  ];

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

export const updateAdress = (
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

export const infoUpdate = (
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
    "name",
    "description",
    "highlights",
    "price_from",
    "average_area_m2",
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

  const highlights = body.highlights;

  if (highlights) {
    for (const key in highlights) {
      const highlight = highlights[key];

      for (const key in highlight) {
        if (!validKeys.includes(key)) {
          return res
            .status(400)
            .json({ message: `Chave '${key}' inválida para os destaques.` });
        }
      }
    }
  }

  next();
};

export const infraUpdate = (
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

export const photoUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, photos } = req.body;

  if (!id) {
    Console({ type: "error", message: "ID da obra não informado." });

    return res.status(400).json({
      message: "ID da obra não informado.",
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


export const photoDelete = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, public_id } = req.body;

  if (!id) {
    Console({ type: "error", message: "ID da obra não informado." });

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