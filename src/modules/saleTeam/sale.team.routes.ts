import { Router } from "express";
import saleTeamController from "./sale.team.controller";
import { findSaleTeam, changeTeamManager, createSaleTeam, insertTeamMember, removeTeamMember } from "./middlewares/saleTeam.middleware";


const SaleTeam = saleTeamController
const routes = Router();

// Rotas de Consulta (GET)
routes.get("/active", SaleTeam.findTeamsActives);
routes.get("/id", findSaleTeam, SaleTeam.findTeam);

// Rotas de Criação (POST)
routes.post("/create", createSaleTeam, SaleTeam.createTeam);

// Rotas de Atualização (PATCH)
routes.patch("/member/insert", insertTeamMember, SaleTeam.insertTeamMember);
routes.patch("/member/remove", removeTeamMember, SaleTeam.removeTeamMember);
routes.patch("/manager", changeTeamManager, SaleTeam.changeTeamManager);

export default routes;
