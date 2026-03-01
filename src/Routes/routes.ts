// src/routes/routes.ts
import { Router } from "express";

import userRoutes from "./user.routes";
import pendingIssuesRoutes from "./pendingissues.routes";
import customerRoutes from "./customer.routes";
import saleTeamRoutes from "./sale.team.routes";





const routes = Router();



// * + import { verifyToken } from "../Middlewares/Auth/verifyToken";
// ? | Futura rota responsavel apenas por autenticação
// * + routes.use("/auth", authRoutes);
// ! | com isso, garantimos a segurança nas proximas rotas sem ter que
// ! | replicar o verifyToken como middleware em todas as functions
// * + routes.use(verifyToken);



routes.use("/users", userRoutes);
routes.use("/pendingissues", pendingIssuesRoutes);
routes.use("/customer", customerRoutes);
routes.use("/sale-team", saleTeamRoutes);


// * + import testRoutes from "./test.routes";
// ! | Rotas de teste integração com erp — remover antes de produção
// * | routes.use("/erpTest", testRoutes);


export default routes;
