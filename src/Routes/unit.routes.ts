import { Router } from "express";

import Unit from "../Controllers/unit.controller";

const routes = Router();

routes.post("/create", Unit.createTemp);

routes.get("/avaliables", Unit.searchAvaliables);

export default routes;
