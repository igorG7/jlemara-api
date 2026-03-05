import { Router } from "express";
import { readPending, createPending, deletePending, updatePending } from "./middlewares/pendingIssue.middleware";
import controller from "./pendingIssues.controller";



const routes = Router();

// * Rotas CRUD PendingIssues (Pendências)

// Rotas de Busca (GET)
routes.get("/", readPending, controller.findPendingIssue);

// Rotas de Criação (POST)
routes.post(
  "/register",
  createPending,
  controller.registerPendingIssue,
);

// Rotas de Deleção (DELETE/PATCH)
routes.patch(
  "/delete",
  deletePending,
  controller.deletePendingIssue,
);

// Rotas de Atualização (PACTH/PUT)
routes.patch(
  "/update",
  updatePending,
  controller.updatePendingIssue,
);

export default routes;
