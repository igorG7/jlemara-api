import { NextFunction, Request, Response } from "express"
import Console from "../../utils/Console";
import { SaleTeamType } from "../domain/saleTeam.interface";

export const createSaleTeam = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const requiredKeys = [
        "name",
        "description",
        "manager",
    ];
    const newTeam: SaleTeamType = req.body


    if (!newTeam) {
        Console({ type: "error", message: "A equipe não foi fornecida." });
        return res
            .status(400)
            .json({ message: "A equipe não foi fornecida.", error: null });
    }

    for (const key of requiredKeys) {
        if (!(key in newTeam)) {
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

    next();
}

export const findSaleTeam = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.body
    if (!id) {
        Console({ type: "error", message: "Id da equipe não fornecido." });
        return res
            .status(400)
            .json({ message: "Id da equipe não fornecido.", error: null });
    }
    next();
}

export const changeTeamManager = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { teamId, newManagerId } = req.body;

    if (!teamId) {
        Console({ type: "error", message: "Id da equipe não fornecido." });
        return res.status(400).json({ message: "Id da equipe não fornecido.", error: null });
    }

    if (!newManagerId) {
        Console({ type: "error", message: "Id do novo gerente não fornecido." });
        return res.status(400).json({ message: "Id do novo gerente não fornecido.", error: null });
    }

    next();
};

export const insertTeamMember = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { teamId, userId } = req.body;

    if (!teamId) {
        Console({ type: "error", message: "Id da equipe não fornecido." });
        return res.status(400).json({ message: "Id da equipe não fornecido.", error: null });
    }

    if (!userId) {
        Console({ type: "error", message: "Id do usuário não fornecido." });
        return res.status(400).json({ message: "Id do usuário não fornecido.", error: null });
    }

    next();
};

export const removeTeamMember = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { teamId, userId } = req.body;

    if (!teamId) {
        Console({ type: "error", message: "Id da equipe não fornecido." });
        return res.status(400).json({ message: "Id da equipe não fornecido.", error: null });
    }

    if (!userId) {
        Console({ type: "error", message: "Id do usuário não fornecido." });
        return res.status(400).json({ message: "Id do usuário não fornecido.", error: null });
    }

    next();
};
