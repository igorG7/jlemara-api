// src/routes/routes.ts
import { Router } from "express";

import userRoutes from "./user.routes";
import pendingIssuesRoutes from "./pendingissues.routes";
import { verifyToken } from "../Middlewares/Users/verifyToken";

const routes = Router();

// domínio / cadastros

routes.use("/users", userRoutes);
routes.use("/pendingissues", verifyToken, pendingIssuesRoutes);

export default routes;
