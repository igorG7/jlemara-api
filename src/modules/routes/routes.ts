// src/routes/routes.ts
import { Router } from "express";

import userRoutes from "../user/user.routes";
import pendingIssuesRoutes from "../pendingIssues/pendingissues.routes";
import { verifyToken } from "../utils/verifyToken";
import customerRoutes from "../customer/customer.routes";
import developmentRoutes from "../development/development.routes";
import saleTeamRoutes from "../saleTeam/sale.team.routes";
import unitRoutes from "../unit/unit.routes";
const routes = Router();

routes.use("/users", userRoutes);
// routes.use(verifyToken);
routes.use("/pendingissues", pendingIssuesRoutes);
routes.use("/customer", customerRoutes);
routes.use("/development", developmentRoutes);
routes.use("/sale-team", saleTeamRoutes);
routes.use("/unit", unitRoutes);

export default routes;
