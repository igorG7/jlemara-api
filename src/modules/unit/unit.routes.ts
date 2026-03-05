import { Router } from "express";

import Unit from "./unit.controller";
import { findUnits, addPhoto, deletePhoto, unitPhoto, updatePhoto } from "./middlewares/unit.middleware";


const routes = Router();

routes.get("/avaliables/page/:page/limit/:limit", Unit.findAvaliables);


routes.post("/create", Unit.createTemp);
routes.post("/search/page/:page/limit/:limit", findUnits, Unit.findUnits,);


routes.patch("/update", addPhoto, Unit.updateUnit);


routes.patch("/photo/add", unitPhoto, Unit.addPhotos);
routes.patch("/photo/remove", deletePhoto, Unit.removePhoto);
routes.patch("/photo/update", updatePhoto, Unit.updatePhoto);

export default routes;
