import { Router } from "express";

import Customer from "../Controllers/costumer.controller";

import { validateFindCustomer } from "../Middlewares/Costumer/validateFindCustomer";

const routes = Router();

routes.post("/create", Customer.createClient); // * Temporario
routes.get("/find", validateFindCustomer, Customer.findCustomer);

export default routes;
