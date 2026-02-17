import { NextFunction, Request, Response } from "express";
import Console from "../../Lib/Console";

export const validateChangeTeamManager = (
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
