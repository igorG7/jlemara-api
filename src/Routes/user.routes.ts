import { Router } from "express";

import User from "../Controllers/user.controller";

// Middlewares User
import { hasUserData } from "../Middlewares/Users/userData";
import { validateUpdateKeys } from "../Middlewares/Users/validateUpdateKeys";
import { validateRegister } from "../Middlewares/Users/validateRegister";
import { validateUpdatePass } from "../Middlewares/Users/validateUpdatePass";
import { validateFindUser } from "../Middlewares/Users/validateFindUser";
import { verifyToken } from "../Middlewares/Auth/verifyToken";
//

const routes = Router();

//  Rotas CRUD User
//  Rotas de Criação/Envio (POST)
routes.post("/login", hasUserData, User.authUser);
routes.post("/register", validateRegister, User.registerUser);

//  Rotas de Consulta (GET)
routes.get("/user/id", verifyToken, validateFindUser, User.findUser);
routes.get("/user/email", verifyToken, validateFindUser, User.findUser);
routes.get("/active", verifyToken, User.findActiveUsers);

//  Rotas de Atualização (PUT/PATCH)
routes.patch("/update", verifyToken, validateUpdateKeys, User.updateUser);
routes.patch("/update/password", verifyToken, validateUpdatePass, User.updateUserPass);

export default routes;
