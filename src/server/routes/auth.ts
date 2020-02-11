import { Router } from "express";
import { signUpRequestValidator } from "../middlewares/signup-validator";

const authRouter = Router();

authRouter.route("/signup").post(...signUpRequestValidator, (req, res) => {
  res.status(501);
  res.end();
});

export default authRouter;
