import { Router } from "express";

import Customer from "../Controllers/costumer.controller";

import { validateFindCustomer } from "../Middlewares/Costumer/validateFindCustomer";

const routes = Router();

routes.post("/create", Customer.createClient); // * Temporario
routes.get("/find", validateFindCustomer, Customer.findCustomer);
routes.get("/find/name", Customer.findCustomerByPartialName);
routes.get("/", Customer.listAll);
routes.get("/actives", Customer.listAllActiveCustomers);

export default routes;
