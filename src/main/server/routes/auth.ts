import { Router } from "express";
import { signUpRequestValidator } from "../middlewares/auth";
import { signUpController } from "../controllers/auth";

const authRouter = Router();

authRouter.route("/signup").post(...signUpRequestValidator, signUpController);

export default authRouter;
