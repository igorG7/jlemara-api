import { Router } from "express";

import Unit from "../Controllers/unit.controller";

import { validateFindUnits } from "../Middlewares/Unit/validateFindUnits";

const routes = Router();

routes.post("/create", Unit.createTemp);

routes.post("/search", validateFindUnits, Unit.findUnits);
routes.get("/avaliables", Unit.searchAvaliables);

export default routes;
