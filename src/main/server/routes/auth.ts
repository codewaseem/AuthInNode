import { Router } from "express";
import { signUpRequestValidator } from "../middlewares/auth";
import { signUpController, activateUserController } from "../controllers/auth";
import { onlyJSONContentType } from "../middlewares";

const authRouter = Router();

authRouter.route("/signup").post(...signUpRequestValidator, signUpController);
authRouter.route("/activate").post(onlyJSONContentType, activateUserController);

export default authRouter;
