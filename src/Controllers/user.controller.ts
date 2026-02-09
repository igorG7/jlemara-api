import { Request, Response } from "express";
import Console from "../Lib/Console";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import User from "../Models/User";

import { UserType } from "../Models/User";

export type AuthBody = { email: string; password: string };
export type FindUserBody = { email?: string; id?: string };
export type UpdateUserBody = { id: string; body: UserType };
export type UpdatePassBody = { id: string; password: string };

const notReturn = {
  password: 0,
  createdAt: 0,
  updatedAt: 0,
  lastAccessAt: 0,
};

class UserController {
  updateUserAccess = async (id: string) => {
    const userUpdated = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          lastAccessAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true, select: { password: 0 } },
    );

    return userUpdated;
  };

  checkUserExists = async (email: string) => {
    const user = await User.findOne({ email });
    return user;
  };

  authUser = async (req: Request, res: Response) => {
    try {
      const { email, password }: AuthBody = req.body;

      const user = await User.findOne({ email }).lean();

      if (!user) {
        Console({ type: "error", message: "Usuário não encontrado." });
        return res
          .status(404)
          .json({ message: "Usuário não encontrado", error: null });
      }

      const comparePass = await bcrypt.compare(
        password,
        user.password as string,
      );

      if (!comparePass) {
        Console({ type: "error", message: "Credencias inválidas." });
        return res.status(401).json({ message: "Credencias inválidas." });
      }

      if (!user.isActive) {
        Console({ type: "error", message: "Usuário inativo." });
        return res.status(400).json({ message: "Usuário inativo." });
      }

      const userUpdated = (await this.updateUserAccess(user._id)) ?? user;


      //       CONTEXTO DE ALTERAÇÕES:
      /* * ARQUITETURA DE SESSÃO CENTRALIZADA (SSO & SEGURANÇA)
       * ---------------------------------------------------
       * EVOLUÇÃO: Migração da gestão de cookies do Client-side para Server-side.
       * * BENEFÍCIOS:
       * 1. SEGURANÇA (Anti-XSS): Flag 'httpOnly' impede que scripts maliciosos acessem o token.
       * 2. ESCALABILIDADE (Subdomínios): O uso de '.seudominio.com' garante que módulos
       * independentes (vendas, obras, lotes) compartilhem a mesma sessão automaticamente.
       * 3. PERFORMANCE: Payload JWT (ID, Name, Role) evita consultas excessivas ao DB.
       * * FLUXO:
       * 1. API valida credenciais e gera JWT assinado com dados de acesso.
       * 2. O Header 'Set-Cookie' instrui o browser a persistir a sessão de forma segura.
       * 3. Browser anexa o cookie automaticamente em todas as requisições para dominio e subdomínios.
       */


      const token = jwt.sign(
        {
          id: userUpdated._id,
          name: userUpdated.name,
          role: userUpdated.role
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      Console({
        type: "success",
        message: "Usuário autenticado com sucesso.",
      });

      res.cookie('auth_token', token, {
        domain: process.env.DOMAIN_DEV!, // Permite acesso em todos os subdomínios
        path: '/',                 // Disponível em todo o site
        httpOnly: true,            // Impede leitura via document.cookie (segurança)
        secure: process.env.NODE_ENV === 'production', // Só envia via HTTPS em produção
        sameSite: 'lax',           // Permite que o cookie seja enviado em navegações entre subdomínios
        maxAge: 1 * 4 * 60 * 60 * 1000 // 4 HORAS
      });


      return res.status(200).json({
        message: "Usuário autenticado com sucesso.",
        data: {
          id: userUpdated._id,
          name: userUpdated.name,
          role: userUpdated.role,
        },
      });
    } catch (error) {
      Console({ type: "error", message: "Erro inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado", error });
    }
  };

  registerUser = async (req: Request, res: Response) => {
    try {
      const body: UserType = req.body;
      const userExist = await this.checkUserExists(body.email as string);

      if (userExist) {
        Console({ type: "error", message: "Usuário já cadastrado." });
        return res
          .status(400)
          .json({ message: "Usuário já cadastrado.", error: null });
      }

      const salt = await bcrypt.genSalt(12);
      const hashPass = await bcrypt.hash(body.password as string, salt);

      const newUser: UserType = {
        ...body,
        password: hashPass,
        updatedAt: new Date(),
        createdAt: new Date(),
        lastAccessAt: new Date(),
      };

      await User.create(newUser);

      Console({ type: "success", message: "Usuário cadastrado com sucesso." });
      return res.status(201).json({
        message: "Usuário cadastrado com sucesso.",
        data: null,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado", error });
    }
  };

  findUser = async (req: Request, res: Response) => {
    try {
      const { email, id }: FindUserBody = req.body;

      const query = id ? { _id: id } : { email };

      const user = await User.findOne(query, { ...notReturn });

      if (!user) {
        Console({ type: "error", message: "Usuário não encontrado." });
        return res
          .status(404)
          .json({ message: "Usuário não encontrado.", error: null });
      }

      Console({ type: "success", message: "Usuário encontrado com sucesso." });
      return res
        .status(200)
        .json({ message: "Usuário encontrado com sucesso.", user });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado", error });
    }
  };

  findActiveUsers = async (req: Request, res: Response) => {
    try {
      const activeUsers = (await User.find(
        { isActive: true },
        { password: 0 },
      ).lean()) as UserType[];

      if (!activeUsers.length) {
        Console({ type: "error", message: "Nenhum usuário encontrado." });
        return res
          .json(404)
          .json({ message: "Nenhum usuário encontrado.", error: null });
      }

      return res.status(200).json({ activeUsers });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado", error });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const { id, ...body }: UpdateUserBody = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { ...body, updatedAt: new Date() },
        { new: true, select: { ...notReturn } },
      );

      if (!user) {
        Console({ type: "error", message: "Usuário não encontrado." });
        return res
          .status(404)
          .json({ message: "Usuário não encontrado.", error: null });
      }

      Console({ type: "success", message: "Usuário atualizado com sucesso." });

      return res.status(200).json({
        message: "Usuário atualizado com sucesso.",
        data: user,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado", error });
    }
  };

  updateUserPass = async (req: Request, res: Response) => {
    try {
      const { id, password }: UpdatePassBody = req.body;

      const salt = await bcrypt.genSalt(12);
      const newHashPass = await bcrypt.hash(password, salt);

      const user = await User.findByIdAndUpdate(
        id,
        {
          password: newHashPass,
          updatedAt: new Date(),
        },
        { new: true, select: { ...notReturn } },
      ).lean();

      if (!user) {
        Console({ type: "error", message: "Usuário não encontrado." });
        return res
          .status(404)
          .json({ message: "Usuário não encontrado.", error: null });
      }

      Console({ type: "success", message: "Senha atualizada com sucesso." });

      return res
        .status(200)
        .json({ message: "Senha atualizada com sucesso.", data: null });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado", error });
    }
  };
}

export default new UserController();
