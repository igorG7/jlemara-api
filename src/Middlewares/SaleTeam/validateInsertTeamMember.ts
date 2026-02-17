import { NextFunction, Request, Response } from "express";
import Console from "../../Lib/Console";

export const validateInsertTeamMember = (
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
