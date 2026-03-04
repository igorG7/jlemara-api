import { NextFunction, Request, Response } from "express";
import Console from "../../../Lib/Console";



export const addPhoto = (
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

    const validKeys = ["latitude", "longitude"];

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

export const deletePhoto = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id, public_id } = req.body;

    if (!id) {
        Console({ type: "error", message: "ID da unidade não informado." });

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

export const updatePhoto = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id, photo } = req.body;

    if (!id) {
        Console({ type: "error", message: "ID da unidade não informado." });

        return res.status(400).json({
            message: "ID da obra não informado.",
            error: null,
        });
    }

    if (!photo) {
        Console({
            type: "error",
            message: "Nenhuma informação para atualização de foto fornecida.",
        });

        return res.status(400).json({
            message: "Nenhuma informação para atualização de foto fornecida.",
            error: null,
        });
    }

    const validKeys = ["url", "caption", "visibility", "public_id"];

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

    next();
};

export const unitPhoto = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id, photos } = req.body;

    if (!id) {
        Console({ type: "error", message: "ID da unidade não informado." });

        return res.status(400).json({
            message: "ID da unidade não informado.",
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

