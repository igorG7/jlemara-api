import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import Console from "../../Lib/Console";

/**
 * Middleware responsável por verificar a autenticidade do token de acesso (JWT) presente nos cookies.
 *
 * Regras de validação:
 * - O cookie 'auth_token' deve estar presente na requisição.
 * - O token deve ser válido e assinado com a 'JWT_SECRET' do servidor.
 *
 * Comportamento:
 * - Retorna HTTP 401 se o token estiver ausente, expirado ou for corrompido.
 * - Injeta os dados decodificados (id, name, role) no objeto 'req.user' para uso nas Controllers.
 * - Caso a validação passe, a requisição segue para o próximo middleware.
 *
 * @param {Request} req - Objeto da requisição do Express contendo os cookies.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função que chama o próximo middleware da cadeia.
 *
 * @returns {Response | void} Retorna uma resposta HTTP 401 em caso de erro ou chama `next()` em caso de sucesso.
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Resgatando o token do cabeçalho da request via cookie-parser
  const token = req.cookies.auth_token;

  if (!token) {
    Console({ type: "error", message: "Sessão não encontrada ou token ausente." });
    return res.status(401).json({ message: "Sessão expirada.", error: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // Injeta as informações decodificadas na request para acesso global nas rotas
    (req as any).user = decoded;

    next();
  } catch (error) {
    Console({ type: "error", message: "Token de acesso inválido ou corrompido." });
    return res
      .status(401)
      .json({ message: "Token de acesso inválido ou corrompido.", error });
  }
};
