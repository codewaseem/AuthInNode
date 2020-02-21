import { Router } from "express";
import {
  signUpRequestValidator,
  loginRequestValidator,
} from "../middlewares/auth";
import {
  signUpController,
  activateUserController,
  loginController,
} from "../controllers/auth";
import { onlyJSONContentType } from "../middlewares";

const authRouter = Router();

authRouter.route("/signup").post(...signUpRequestValidator, signUpController);
authRouter.route("/activate").post(onlyJSONContentType, activateUserController);
authRouter.route("/login").post(loginRequestValidator, loginController);

export default authRouter;
