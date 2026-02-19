import { Router } from "express";

import Development from "../Controllers/develpment.controller";

import { validateFindDevelopment } from "../Middlewares/Development/validateFindDevelopment";
import { validateLocationUpdate } from "../Middlewares/Development/validateLocationUpdate";
import { validateInfraUpdate } from "../Middlewares/Development/validateInfraUpdate";
import { validateInfoUpdate } from "../Middlewares/Development/validateInfoUpdate";
import { validatePhotoUpdate } from "../Middlewares/Development/validatePhotoUpdate";

const routes = Router();

routes.post("/register", Development.createTemp);
routes.post("/search", validateFindDevelopment, Development.findDevelopment);
routes.get("/:page", Development.listAll);
routes.get("/public/:page", Development.findPublics);

routes.patch(
  "/update/location",
  validateLocationUpdate,
  Development.updateLocation,
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

routes.patch("/update/photos", validatePhotoUpdate, Development.addPhoto);

export default routes;
