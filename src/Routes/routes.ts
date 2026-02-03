// src/routes/routes.ts
import { Router } from "express";

import userRoutes from "./user.routes";
import pendingIssuesRoutes from "./pendingissues.routes";

const routes = Router();

// domínio / cadastros

routes.use("/users", userRoutes);
routes.use("/pendingissues", pendingIssuesRoutes);

export default routes;
