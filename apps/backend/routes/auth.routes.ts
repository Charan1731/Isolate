import { Router } from "express";
import { login, register, registerTenant } from "../controller/auth/auth.controller";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login)
authRouter.post("/register-tenant", registerTenant)

export default authRouter;