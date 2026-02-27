import { Router } from "express";

import Unit from "../Controllers/unit.controller";

import { validateFindUnits } from "../Middlewares/Unit/validateFindUnits";
import { validatePhotoUnit } from "../Middlewares/Unit/validatePhotosUnit";
import { validatePhotoDelete } from "../Middlewares/Unit/validateDeletePhoto";

const routes = Router();

routes.post("/create", Unit.createTemp);

routes.post("/search", validateFindUnits, Unit.findUnits);
routes.get("/avaliables", Unit.searchAvaliables);

routes.patch("/update/photo", validatePhotoUnit, Unit.addPhotos);
routes.patch("/update/photo/remove", validatePhotoDelete, Unit.removePhoto);

export default routes;
