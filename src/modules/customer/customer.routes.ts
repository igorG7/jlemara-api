import { Router } from "express";
import Customer from './customer.controller'
import { findAdress, findCustomer, findManyAdress, updateCustomer, updatePhoneCustomer } from "./middlewares/customer.middleware";

const routes = Router();
routes.post("/create", Customer.createClient);

// Rotas de busca (GET)
routes.get("/page/:page/number/:number", Customer.listAll);

routes.get("/actives/page/:page/number/:number", Customer.listAllActiveCustomers);

routes.get("/search/:name", Customer.findCustomerByPartialName);

routes.get("/address/:code_person", findAdress, Customer.findAddressCustomer);

// Rotas de busca que utlizam filtros mais detalhadas (POST).
// A utilização de POST de faz necessária para um envio de dados mais complexo para realizar a busca.
routes.post("/search", findCustomer, Customer.findCustomer);

routes.post("/address", findManyAdress, Customer.findManyAddressCustomer);

// Rotas de atualização (PUT/PATCH)
routes.patch("/update", updateCustomer, Customer.updateCustomer);
routes.patch("/update/phone", updatePhoneCustomer, Customer.updatePhoneCustomer);

export default routes;
