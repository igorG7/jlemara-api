import { Router } from "express";

import User from "./user.controller";
import { hasUserData } from "./middlewares/data.middleware";
import { findUser, register, findUsersByRole, updateKeys, updatePass } from "./middlewares/user.middlewares";


const routes = Router();

//  Rotas CRUD User
//  Rotas de Criação/Envio (POST)
routes.post("/login", hasUserData, User.authUser);
routes.post("/register", register, User.registerUser);

//  Rotas de Consulta (GET)
routes.get("/user/id", /* verifyToken, */ findUser, User.findUser);
routes.get("/user/email", /* verifyToken, */ findUser, User.findUser);
routes.get("/user/role", /* verifyToken, */ findUsersByRole, User.findUserByRole);
routes.get("/active", /* verifyToken, */ User.findActiveUsers);

//  Rotas de Atualização (PUT/PATCH)
routes.patch("/update", /* verifyToken, */ updateKeys, User.updateUser);
routes.patch("/update/password", /* verifyToken, */ updatePass, User.updateUserPass);

export default routes;
