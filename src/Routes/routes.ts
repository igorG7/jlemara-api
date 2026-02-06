// src/routes/routes.ts
import { Router } from "express";

import userRoutes from "./user.routes";
import pendingIssuesRoutes from "./pendingissues.routes";
import customerRoutes from "./customer.routes";

const routes = Router();

// domínio / cadastros
routes.use("/users", userRoutes);
routes.use("/pendingissues", pendingIssuesRoutes);
routes.use("/customer", customerRoutes);

export default routes;
