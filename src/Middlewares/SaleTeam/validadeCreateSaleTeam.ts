import { NextFunction, Request, Response } from "express"
import Console from "../../Lib/Console";
import { SaleTeamType } from "Models/SaleTeam";

export const validadeCreateSaleTeam = (
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