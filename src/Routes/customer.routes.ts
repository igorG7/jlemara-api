import { Router } from "express";

import Customer from "../Controllers/costumer.controller";

import { validateFindCustomer } from "../Middlewares/Costumer/validateFindCustomer";
import { validateCustomerUpdate } from "../Middlewares/Costumer/validateCustomerUpdate";
import { validateFindAddress } from "../Middlewares/Costumer/validateFindAddress";
import { validateFindManyAddress } from "../Middlewares/Costumer/validateFindManyAddress";

const routes = Router();

routes.post("/create", Customer.createClient); // * Temporario

// Rotas de busca (GET)
routes.get("/page/:page/number/:number", Customer.listAll);

routes.get(
  "/address/:code_person",
  validateFindAddress,
  Customer.findAddressCustomer,
);

routes.get(
  "/actives/page/:page/number/:number",
  Customer.listAllActiveCustomers,
);

// Rotas de busca que utlizam filtros mais detalhadas (POST).
// A utilização de POST de faz necessária para um envio de dados mais complexo para realizar a busca.
routes.post("/search", validateFindCustomer, Customer.findCustomer);
routes.post("/search/name", Customer.findCustomerByPartialName);

routes.post(
  "/addres",
  validateFindManyAddress,
  Customer.findManyAddressCustomer,
);

// Rotas de atualização (PUT/PATCH)

routes.patch("/update", validateCustomerUpdate, Customer.updateCustomer);

export default routes;
