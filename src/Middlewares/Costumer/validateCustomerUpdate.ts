import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar as chaves enviadas na atuaçização de um cliente.
 * Regras de validação:
 * - O campo `id` é obrigatório e deve estar presente no corpo da requisição.
 * - O corpo da requisição deve conter ao menos um campo para atualização.
 * - Apenas as chaves previamente definidas em `validKeys` são permitidas para atualização.
 *
 * Comportamento:
 * - Retorna HTTP 400 se o `id` não for informado.
 * - Retorna HTTP 400 se nenhuma informação de atualização for enviada.
 * - Retorna HTTP 400 se houver qualquer chave inválida no corpo da requisição.
 * - Retorna HTTP 400 se houver alguma chave válida sem valor.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateCustomerUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, ...body } = req.body;

  const validKeys = ["email", "full_name", "cpf_person"];

  if (!id) {
    Console({ type: "error", message: "Id não informado." });
    return res.status(400).json({ message: "Id não informado.", error: null });
  }

  if (!body) {
    Console({ type: "error", message: "Nenhuma informação foi enviada." });
    return res
      .status(400)
      .json({ message: "Nenhuma informação foi enviada.", error: null });
  }

  for (const [key, value] of Object.entries(body)) {
    if (!validKeys.includes(key) || !value) {
      Console({ type: "error", message: `Chave '${key}' inválida ou vazia.` });

      return res.status(400).json({
        message: `Chave '${key}' inválida ou vazia.`,
        error: null,
      });
    }
  }

  next();
};
