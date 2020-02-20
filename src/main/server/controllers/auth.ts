// eslint-disable-next-line no-unused-vars
import { Request, Response } from "express";
import { authInteractor } from "../../setup";
import { ResponseStatus } from "../../../constants";

export async function signUpController(req: Request, res: Response) {
  let { email, name, password } = req.body;
  try {
    await authInteractor.signup({
      email,
      name,
      password,
    });
    res.json({
      status: ResponseStatus.Success,
      message: `Hey ${name}, confirmation email has been sent to your email ${email}.`,
    });
  } catch (e) {
    console.log(e);
    res.status(415).json({
      status: ResponseStatus.Error,
      message: `Something went wrong! Please try again later.`,
    });
  }
}

export async function activateUserController(req: Request, res: Response) {
  let { token } = req.body;
  try {
    await authInteractor.activateUser(token);
    res.json({
      status: ResponseStatus.Success,
      message: `Hey, your account has been activated. Please use your email and password to login.`,
    });
  } catch (e) {
    console.log("CAUGHT HERE");
    console.log(e);
    res.status(415).json({
      status: ResponseStatus.Error,
      message: `Something went wrong! Please try again later.`,
    });
  }
}
