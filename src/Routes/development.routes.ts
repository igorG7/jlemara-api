import { Router } from "express";

import Development from "../Controllers/develpment.controller";

import { validateFindDevelopment } from "../Middlewares/Development/validateFindDevelopment";

const routes = Router();

routes.post("/register", Development.createTemp);
routes.post("/search", validateFindDevelopment, Development.findDevelopment);
routes.get("/:page", Development.listAll);
routes.get("/public/:page", Development.findPublics);

export default routes;
