import { Router } from "express";
import SaleTeamController from "../Controllers/sale.team.controller";

// Middlewares SaleTeam
import { validadeFindSaleTeam } from "../Middlewares/SaleTeam/validadeFindSaleTeam";
import { validadeCreateSaleTeam } from "../Middlewares/SaleTeam/validadeCreateSaleTeam";
import { validateInsertTeamMember } from "../Middlewares/SaleTeam/validateInsertTeamMember";
import { validateRemoveTeamMember } from "../Middlewares/SaleTeam/validateRemoveTeamMember";
import { validateChangeTeamManager } from "../Middlewares/SaleTeam/validateChangeTeamManager";
//

const SaleTeam = new SaleTeamController();
const routes = Router();

// Rotas de Consulta (GET)
routes.get("/active", SaleTeam.findTeamsActives);
routes.get("/id", validadeFindSaleTeam, SaleTeam.findTeam);

// Rotas de Criação (POST)
routes.post("/create", validadeCreateSaleTeam, SaleTeam.createTeam);

// Rotas de Atualização (PATCH)
routes.patch("/member/insert", validateInsertTeamMember, SaleTeam.insertTeamMember);
routes.patch("/member/remove", validateRemoveTeamMember, SaleTeam.removeTeamMember);
routes.patch("/manager", validateChangeTeamManager, SaleTeam.changeTeamManager);

export default routes;
