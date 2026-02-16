import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar a chave enviada na busca de um endereço de cliente.
 * Regras de validação:
 * - O parâmetro `code_person` é obrigatório e deve ser enviado.
 *
 * Comportamento:
 * - Retorna HTTP 400 se o 'code_person' não for informado.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateFindAddress = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const code_person = req.params.code_person;

  if (!code_person) {
    Console({ type: "error", message: "Nenhum Código Pessoa foi fornecido." });
    return res
      .status(400)
      .json({ message: "Nenhum Código Pessoa foi fornecido.", error: null });
  }

  next();
};
