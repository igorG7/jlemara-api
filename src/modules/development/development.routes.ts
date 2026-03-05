import { Router } from "express";

import controller from './develpment.controller'
import {
  findDevelopment, infoUpdate, infraUpdate,
  photoDelete, photoUpdate, updateAdress, updateDevelopment
} from "./middlewares/development.middleware";



const routes = Router();

routes.post("/register", controller.createTemp);
routes.post("/search", findDevelopment, controller.findDevelopment);
routes.get("/page/:page/number/:number", controller.listAll);
routes.get("/public/page/:page/number/:number", controller.listPublics);

routes.patch(
  "/update/address",
  updateAdress,
  controller.updateAddress,
);

routes.patch(
  "/update/infrastructure",
  infraUpdate,
  controller.updateInfrastructure,
);

routes.patch(
  "/update/infosite",
  infoUpdate,
  controller.updateInfosSite,
);

routes.patch(
  "/update",
  updateDevelopment,
  controller.updateDevelopment,
);

routes.patch("/update/photos", photoDelete, controller.addPhoto);
routes.patch("/delete/photos", photoUpdate, controller.removePhoto);

export default routes;
