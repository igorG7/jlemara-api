import { NextFunction, Request, Response } from "express";
import { FindUserBody, FindUserByRole, UpdatePassBody, UpdateUserBody } from "../user.controller";
import Console from "../../utils/Console";
import { UserType } from "../domain/user.interface";

export const findUser = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { email, id }: FindUserBody = req.body;

    if (!id && !email) {
        Console({
            type: "error",
            message: "Id ou email devem ser informados.",
        });
        return res
            .status(400)
            .json({ message: "Id ou email devem ser informados.", error: null });
    }

    next();
};

export const findUsersByRole = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { role }: FindUserByRole = req.body;

    if (!role) {
        Console({
            type: "error",
            message: "A ROLE deve ser informada.",
        });
        return res
            .status(400)
            .json({ message: "A ROLE deve ser informada.", error: null });
    }

    next();
};

export const register = (
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
        // "instance", // propriedade legada | relacionada ao uso da api não oficial da meta
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


export const updateKeys = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id, ...body }: UpdateUserBody = req.body;
    const validKeys = [
        "email",
        "isActive",
        "company",
        "instance",
        "phone",
        "name",
        "role",
    ];

    if (!id) {
        Console({ type: "error", message: "Id não informado." });
        return res.status(400).json({ message: "Id não informado.", error: null });
    }

    if (!body) {
        return res
            .status(400)
            .json({ message: "Nenhuma informação foi enviada.", error: null });
    }

    for (const key in body) {
        if (!validKeys.includes(key)) {
            console.log(key, "invalido");
            return res
                .status(400)
                .json({ message: "Chaves inválidas.", error: null });
        }
    }

    next();
};


export const updatePass = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id, password }: UpdatePassBody = req.body;

    if (!id) {
        Console({ type: "error", message: "Id não informado." });
        return res.status(400).json({ message: "Id não informado.", error: null });
    }

    if (!password) {
        Console({ type: "error", message: "Nova senha não informada." });
        return res
            .status(400)
            .json({ message: "Nova senha não informada.", error: null });
    }
    next();
};