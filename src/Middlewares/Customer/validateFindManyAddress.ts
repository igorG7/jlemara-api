import { Request, Response, NextFunction } from "express";
import Console from "../../Lib/Console";

/**
 * Middleware responsável por validar a chave enviada na busca de endereços de um grupo de clientes.
 * Regras de validação:
 * - O parâmetro `codes` é obrigatório e deve ser enviado.
 * - A lista de códigos 'codes' não pode estar vazia.
 * - Os códigos fornecidos devem ser transformados em tipo 'number' sem gerar 'NaN'.
 *
 * Comportamento:
 * - Retorna HTTP 400 se o 'codes' não for informado ou não possuir nenhum código.
 * - Retorna HTTP 400 se algum código gerar 'NaN' após transformação.
 * - Caso todas as validações passem, a requisição segue para o próximo middleware
 *
 * @param {Request} req - Objeto da requisição do Express contendo o corpo com os dados de atualização.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 400 em caso de erro ou chama `next()` em caso de sucesso.
 */

export const validateFindManyAddress = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { codes } = req.body;

  if (!codes.length) {
    Console({ type: "error", message: "Nenhum Código Pessoa foi fornecido." });
    return res
      .status(400)
      .json({ message: "Nenhum Código Pessoa foi fornecido.", error: null });
  }

  for (const code of codes) {
    if (!Number(code)) {
      return res.status(400).json({
        message: `O código '${code}' deve conter apenas números.`,
        error: null,
      });
    }
  }

  next();
};
