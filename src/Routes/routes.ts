// src/routes/routes.ts
import { Router } from "express";

import userRoutes from "../modules/user/user.routes";
import pendingIssuesRoutes from "./pendingissues.routes";
import { verifyToken } from "../Middlewares/Auth/verifyToken";
import customerRoutes from "../modules/customer/customer.routes";
import developmentRoutes from "./development.routes";
import saleTeamRoutes from "./sale.team.routes";
import unitRoutes from "../modules/unit/unit.routes";
const routes = Router();

routes.use("/users", userRoutes);
// routes.use(verifyToken);
routes.use("/pendingissues", pendingIssuesRoutes);
routes.use("/customer", customerRoutes);
routes.use("/development", developmentRoutes);
routes.use("/sale-team", saleTeamRoutes);
routes.use("/unit", unitRoutes);

export default routes;
