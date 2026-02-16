import { Router } from "express";

import Development from "../Controllers/develpment.controller";

const routes = Router();

routes.post("/register", Development.createTemp);

export default routes;
