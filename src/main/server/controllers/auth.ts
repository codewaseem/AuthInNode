// eslint-disable-next-line no-unused-vars
import { Request, Response } from "express";
import { authInteractor } from "../../setup";
import { sendSuccessResponse, sendErrorResponse } from "../helpers";

export async function signUpController(req: Request, res: Response) {
  let { email, name, password } = req.body;
  try {
    await authInteractor.signup({
      email,
      name,
      password,
    });
    sendSuccessResponse(res, {
      message: `Hey ${name}, confirmation email has been sent to your email ${email}.`,
    });
  } catch (e) {
    console.log(e);
    sendErrorResponse(res, {
      message: e,
    });
  }
}

export async function activateUserController(req: Request, res: Response) {
  let { token } = req.body;
  try {
    await authInteractor.activateUser(token);
    sendSuccessResponse(res, {
      message: `Hey, your account has been activated. Please use your email and password to login.`,
    });
  } catch (e) {
    sendErrorResponse(res, {
      message: e,
    });
  }
}
