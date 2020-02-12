import { Router } from "express";
import { signUpRequestValidator } from "../middlewares/signup-validator";
import { signUpController } from "../controllers";

const authRouter = Router();

authRouter.route("/signup").post(...signUpRequestValidator, signUpController);

export default authRouter;
