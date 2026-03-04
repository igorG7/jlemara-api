import { Router } from "express";

import User from "./user.controller";

// Middlewares User
import { hasUserData } from "./middlewares/data.middleware";
import { validateUpdateKeys } from "./middlewares/updateKeys.middleware";
import { validateRegister } from "./middlewares/register.middleware";
import { validateUpdatePass } from "./middlewares/updatePass.middleware";
import { validateFindUser } from "./middlewares/find.middleware";
import { verifyToken } from "../../Middlewares/Auth/verifyToken";
import { validateFindUsersByRole } from "./middlewares/findByRole.middleware";
//

const routes = Router();

//  Rotas CRUD User
//  Rotas de Criação/Envio (POST)
routes.post("/login", hasUserData, User.authUser);
routes.post("/register", validateRegister, User.registerUser);

//  Rotas de Consulta (GET)
routes.get("/user/id", /* verifyToken, */ validateFindUser, User.findUser);
routes.get("/user/email", /* verifyToken, */ validateFindUser, User.findUser);
routes.get("/user/role", /* verifyToken, */ validateFindUsersByRole, User.findUserByRole);
routes.get("/active", /* verifyToken, */ User.findActiveUsers);

//  Rotas de Atualização (PUT/PATCH)
routes.patch("/update", /* verifyToken, */ validateUpdateKeys, User.updateUser);
routes.patch("/update/password", /* verifyToken, */ validateUpdatePass, User.updateUserPass);

export default routes;
