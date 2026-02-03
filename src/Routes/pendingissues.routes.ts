import { Router } from "express";

import PendingIssues from "../Controllers/pendingIssues.controller";

// Middlewares PendingIssues
import { validateReadPending } from "../Middlewares/PendingIssues/validateReadPending";
import { validateCreatePending } from "../Middlewares/PendingIssues/validateCreatePending";
import { validateUpdatePending } from "../Middlewares/PendingIssues/validateUpdatePending";
import { validateDeletePending } from "../Middlewares/PendingIssues/validateDeletePending";

const routes = Router();

// * Rotas CRUD PendingIssues (Pendências)

// Rotas de Busca (GET)
routes.get("/", validateReadPending, PendingIssues.findPendingIssue);

// Rotas de Criação (POST)
routes.post(
  "/register",
  validateCreatePending,
  PendingIssues.registerPendingIssue,
);

// Rotas de Deleção (DELETE/PATCH)
routes.patch(
  "/delete",
  validateDeletePending,
  PendingIssues.deletePendingIssue,
);

// Rotas de Atualização (PACTH/PUT)
routes.patch(
  "/update",
  validateUpdatePending,
  PendingIssues.updatePendingIssue,
);

export default routes;
