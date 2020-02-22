import { Router } from "express";
import {
  signUpRequestValidator,
  loginRequestValidator,
  resetPasswordValidator,
  setPasswordValidator,
} from "../middlewares/auth";
import {
  signUpController,
  activateUserController,
  loginController,
  passwordResetController,
  setPasswordController,
} from "../controllers/auth";
import { onlyJSONContentType } from "../middlewares";

const authRouter = Router();

authRouter.route("/signup").post(...signUpRequestValidator, signUpController);
authRouter.route("/activate").post(onlyJSONContentType, activateUserController);
authRouter.route("/login").post(loginRequestValidator, loginController);
authRouter
  .route("/reset-password")
  .post(resetPasswordValidator, passwordResetController);

authRouter
  .route("/set-password")
  .post(setPasswordValidator, setPasswordController);

export default authRouter;
