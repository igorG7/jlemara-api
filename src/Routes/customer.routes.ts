import { Router } from "express";

import CostumerController from "../Controllers/costumer.controller";

import { validateFindCustomer } from "../Middlewares/Costumer/validateFindCustomer";
import { validateCustomerUpdate } from "../Middlewares/Costumer/validateCustomerUpdate";

const routes = Router();
const Customer = new CostumerController()
routes.post("/create", Customer.createClient); // * Temporario
routes.get("/find", validateFindCustomer, Customer.findCustomer);
routes.get("/find/name", Customer.findCustomerByPartialName);
routes.get("/", Customer.listAll);
routes.get("/actives", Customer.listAllActiveCustomers);
routes.patch("/update", validateCustomerUpdate, Customer.updateCustomer);

export default routes;

