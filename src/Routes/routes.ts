// src/routes/routes.ts
import { Router } from "express";

import userRoutes from "./user.routes";
import pendingIssuesRoutes from "./pendingissues.routes";
import { verifyToken } from "../Middlewares/Auth/verifyToken";
import customerRoutes from "./customer.routes";
const routes = Router();


routes.use("/users", userRoutes);
routes.use("/pendingissues", verifyToken, pendingIssuesRoutes);
routes.use("/customer", customerRoutes);



export default routes;
