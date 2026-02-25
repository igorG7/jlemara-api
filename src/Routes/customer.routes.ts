import { Router } from "express";

import Customer from "../Controllers/customer.controller";

import { validateFindCustomer } from "../Middlewares/Customer/validateFindCustomer";
import { validateCustomerUpdate } from "../Middlewares/Customer/validateCustomerUpdate";
import { validateFindAddress } from "../Middlewares/Customer/validateFindAddress";
import { validateFindManyAddress } from "../Middlewares/Customer/validateFindManyAddress";
import { validateCustomerPhoneUpdate } from "../Middlewares/Customer/validateCustomerUpdatePhone";

const routes = Router();
routes.post("/create", Customer.createClient); // * Temporario

// Rotas de busca (GET)
routes.get("/page/:page/number/:number", Customer.listAll);

routes.get(
  "/actives/page/:page/number/:number",
  Customer.listAllActiveCustomers,
);

routes.get("/search/:name", Customer.findCustomerByPartialName);

routes.get(
  "/address/:code_person",
  validateFindAddress,
  Customer.findAddressCustomer,
);

routes.post(
  "/phone-numbers",

  Customer.findPhoneNumbers,
);

// Rotas de busca que utlizam filtros mais detalhadas (POST).
// A utilização de POST de faz necessária para um envio de dados mais complexo para realizar a busca.
routes.post("/search", validateFindCustomer, Customer.findCustomer);

routes.post(
  "/addres",
  validateFindManyAddress,
  Customer.findManyAddressCustomer,
);

// Rotas de atualização (PUT/PATCH)
routes.patch("/update", validateCustomerUpdate, Customer.updateCustomer);
routes.patch(
  "/update/phone",
  validateCustomerPhoneUpdate,
  Customer.updatePhoneCustomer,
);

export default routes;
