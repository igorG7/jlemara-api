import { NextFunction, Request, Response } from "express"
import Console from "../../Lib/Console";

export const validadeFindSaleTeam = (
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