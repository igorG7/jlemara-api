import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

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

export const validateFindCustomer = (
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

  const validKeys = [
    "code_person",
    "cpf_person",
    "email",
    "phone_numbers",
    "id",
    "_id",
    "cnpj_person",
  ];

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
      message: `A chave '${key}' não pode estar vazia.`,
    });

    return res
      .status(400)
      .json({ message: `A chave '${key}' não pode estar vazia.`, error: null });
  }

  next();
};
