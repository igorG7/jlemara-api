
import { Request, Response, NextFunction } from "express";
import Console from "../../utils/Console";
import { PendingUserIssueType } from "../domain/pendingIssue.interface";
import { PendingDeleteType, PendingUpdateType } from "../pendingIssues.controller";


export const createPending = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const pendingIssue: PendingUserIssueType = req.body;

    const requiredKeys = [
        "userID",
        "title",
        "description",
        "date",
        "reference",
        "dueDate",
        "status",
        "log",
    ];

    if (!pendingIssue) {
        Console({ type: "error", message: "Pendência não fornecida." });
        return res
            .status(400)
            .json({ message: "Pendência não fornecida.", error: null });
    }

    for (const key of requiredKeys) {
        if (!(key in pendingIssue)) {
            Console({
                type: "error",
                message: `Propriedade '${key}' não fornecido(a).`,
            });

            return res.status(400).json({
                message: `Propriedade '${key}' não fornecido(a).`,
                error: null,
            });
        }
    }

    for (const [key, value] of Object.entries(pendingIssue)) {
        if (!value) {
            Console({
                type: "error",
                message: `Propriedade '${key}' não fornecido(a).`,
            });

            return res.status(400).json({
                message: `Propriedade '${key}' não fornecido(a).`,
                error: null,
            });
        }
    }

    const validStatus = ["PENDING", "IN_PROGRESS", "COMPLETED"];

    if (!validStatus.includes(pendingIssue.status)) {
        Console({ type: "error", message: "Status inválido." });
        return res.status(400).json({ message: "Status inválido.", error: null });
    }

    next();
};

export const deletePending = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { userID, reference }: PendingDeleteType = req.body;

    if (!userID) {
        Console({ type: "error", message: "Id do usuário não fornecido." });
        return res
            .status(400)
            .json({ message: "Id do usuário não fornecido.", error: null });
    }

    if (!reference) {
        Console({
            type: "error",
            message: "Referência de pendência não fornecida.",
        });
        return res.status(400).json({
            message: "Referência de pendência não fornecida.",
            error: null,
        });
    }

    next();
};

export const readPending = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { userID }: { userID: string } = req.body;

    if (!userID) {
        Console({ type: "error", message: "Id de usuário não fornecido." });
        return res
            .status(400)
            .json({ message: "Id de usuário não fornecido.", error: null });
    }
    next();
};

export const updatePending = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { userID, reference, status, notes }: PendingUpdateType = req.body;
    const validStatus = ["PENDING", "IN_PROGRESS", "COMPLETED"];

    if ((!userID && !reference) || !userID || !reference) {
        Console({
            type: "error",
            message: "Id de usuário e referência da pendência devem ser informados.",
        });
        return res.status(400).json({
            message: "Id de usuário e referência da pendência devem ser informados.",
            error: null,
        });
    }

    if (!status && !notes) {
        Console({ type: "error", message: "Sem conteúdo para atualizar." });
        return res
            .status(400)
            .json({ message: "Sem conteúdo para atualizar.", error: null });
    }

    if (!validStatus.includes(status)) {
        Console({ type: "error", message: "Status inválido." });
        return res.status(400).json({ message: "Status inválido.", error: null });
    }

    next();
};