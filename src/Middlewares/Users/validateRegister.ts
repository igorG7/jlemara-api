import { Request, Response, NextFunction } from "express";

import { UserType } from "../../Models/User";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar o corpo da requisição, garantindo que todas as chaves necessárias estejam presentes e contenham seus valores.
 *
 * Regras de validação:
 * - O corpo da requisição deve conter todas as propriedades existentes em 'requiredKeys'.
 * - Todas as propriedades do corpo da requisição, devem conter algum valor que seja válido ao campo.
 *
 * Comportamento:
 * - Retorna HTTP 400 se faltar alguma propriedade no corpo.
 * - Retona HTTP 400 se alguma propriedade não conter valor.
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requiredKeys = [
    "name",
    "email",
    "password",
    "phone",
    "role",
    "company",
    "instance",
    "isActive",
    "pendingIssues",
  ];

  const body: UserType = req.body;

  for (const key of requiredKeys) {
    if (!(key in body)) {
      Console({ type: "error", message: `Campo ${key} é obrigatório.` });
      return res.status(400).json({ message: `Campo ${key} é obrigatório.` });
    }
  }

  for (const [key, value] of Object.entries(body)) {
    if (!value) {
      Console({
        type: "error",
        message: `Campo '${key}' não pode estar vazio.`,
      });
      return res
        .status(400)
        .json({ message: `Campo '${key}' não pode estar vazio.` });
    }
  }

  next();
};
