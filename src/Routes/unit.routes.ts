import { Router } from "express";

import Unit from "../Controllers/unit.controller";

import { validateFindUnits } from "../Middlewares/Unit/validateFindUnits";
import { validatePhotoUnit } from "../Middlewares/Unit/validatePhotosUnit";
import { validatePhotoDelete } from "../Middlewares/Unit/validateDeletePhoto";
import { validateAddPhoto } from "../Middlewares/Unit/validateAddPhoto";
import { validateUpdatePhoto } from "../Middlewares/Unit/validateUpdatePhoto";

const routes = Router();

routes.post("/create", Unit.createTemp);

// Rotas de busca (GET/POST) - POST está sendo utilizado em caso de filtros mais complexos
routes.post(
  "/search/page/:page/limit/:limit",
  validateFindUnits,
  Unit.findUnits,
);

routes.get("/avaliables/page/:page/limit/:limit", Unit.findAvaliables);

// Rotas de atualização (PATCH/PUT)
routes.patch("/update", validateAddPhoto, Unit.updateUnit);

routes.patch("/photo/add", validatePhotoUnit, Unit.addPhotos);
routes.patch("/photo/remove", validatePhotoDelete, Unit.removePhoto);
routes.patch("/photo/update", validateUpdatePhoto, Unit.updatePhoto);

export default routes;
