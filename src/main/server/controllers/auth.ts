// eslint-disable-next-line no-unused-vars
import { Request, Response } from "express";
import { authInteractor } from "../../setup";
import { sendSuccessResponse, sendErrorResponse } from "../helpers";
import {
  TokenExpiredOrInvalid,
  NewPasswordSetSuccessfully,
  UserDoesNotExists,
} from "../../../constants/strings";

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
      statusCode: 400,
    });
  }
}

export async function loginController(req: Request, res: Response) {
  let { email, password } = req.body;
  try {
    let data = await authInteractor.login(email, password);
    sendSuccessResponse(res, {
      data,
    });
  } catch (e) {
    sendErrorResponse(res, {
      message: e,
    });
  }
}

export async function passwordResetController(req: Request, res: Response) {
  let { email } = req.body;
  try {
    await authInteractor.resetPasswordRequest(email);
    sendSuccessResponse(res, {
      message: `Password reset link has been sent your email`,
    });
  } catch (e) {
    sendErrorResponse(res, {
      message: UserDoesNotExists,
    });
  }
}

export async function setPasswordController(req: Request, res: Response) {
  let { token, password } = req.body;
  try {
    await authInteractor.setNewPassword(token, password);
    sendSuccessResponse(res, {
      message: NewPasswordSetSuccessfully,
    });
  } catch (e) {
    sendErrorResponse(res, {
      message: TokenExpiredOrInvalid,
    });
  }
}
