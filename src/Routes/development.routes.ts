import { Router } from "express";

import Development from "../Controllers/develpment.controller";

import { validateFindDevelopment } from "../Middlewares/Development/validateFindDevelopment";
import { validateAddressUpdate } from "../Middlewares/Development/validateAddressUpdate";
import { validateInfraUpdate } from "../Middlewares/Development/validateInfraUpdate";
import { validateInfoUpdate } from "../Middlewares/Development/validateInfoUpdate";
import { validatePhotoUpdate } from "../Middlewares/Development/validatePhotoUpdate";
import { validatePhotoDelete } from "../Middlewares/Development/validatePhotoDelete";
import { validateDevelopmentUpdate } from "../Middlewares/Development/validateDevelopmentUpdate";

const routes = Router();

routes.post("/register", Development.createTemp);
routes.post("/search", validateFindDevelopment, Development.findDevelopment);
routes.get("/page/:page/number/:number", Development.listAll);
routes.get("/public/page/:page/number/:number", Development.listPublics);

routes.patch(
  "/update/address",
  validateAddressUpdate,
  Development.updateAddress,
);

routes.patch(
  "/update/infrastructure",
  validateInfraUpdate,
  Development.updateInfrastructure,
);

routes.patch(
  "/update/infosite",
  validateInfoUpdate,
  Development.updateInfosSite,
);

routes.patch(
  "/update",
  validateDevelopmentUpdate,
  Development.updateDevelopment,
);

routes.patch("/update/photos", validatePhotoUpdate, Development.addPhoto);
routes.patch("/delete/photos", validatePhotoDelete, Development.removePhoto);

export default routes;
