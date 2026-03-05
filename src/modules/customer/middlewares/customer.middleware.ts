import { Request, Response, NextFunction } from "express";
import Console from "../../utils/Console";

export const findCustomer = (
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

export const updateCustomer = (
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

export const findAdress = (
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

export const findManyAdress = (
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

export const updatePhoneCustomer = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id, phone_number } = req.body;

    if (!id) {
        Console({ type: "error", message: "Id do cliente não informado." });
        return res
            .status(400)
            .json({ message: "Id do cliente não informado.", error: null });
    }

    if (!phone_number) {
        Console({ type: "error", message: "Número de telefone não informado." });
        return res
            .status(400)
            .json({ message: "Número de telefone não informado.", error: null });
    }

    next();
};