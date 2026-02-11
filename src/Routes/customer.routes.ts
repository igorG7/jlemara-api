import { Router } from "express";

import CustomerController from "../Controllers/customer.controller";

import { validateFindCustomer } from "../Middlewares/Customer/validateFindCustomer";
import { validateCustomerUpdate } from "../Middlewares/Customer/validateCustomerUpdate";

const routes = Router();
const Customer = new CustomerController()
routes.post("/create", Customer.createClient); // * Temporario
routes.get("/find", validateFindCustomer, Customer.findCustomer);
routes.get("/find/name", Customer.findCustomerByPartialName);
routes.get("/", Customer.listAll);
routes.get("/actives", Customer.listAllActiveCustomers);
routes.patch("/update", validateCustomerUpdate, Customer.updateCustomer);

export default routes;

