import { Router } from "express";

import Development from "../Controllers/develpment.controller";

const routes = Router();

routes.post("/register", Development.createTemp);
routes.get("/:page", Development.listAll);

export default routes;
