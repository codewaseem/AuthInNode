// eslint-disable-next-line no-unused-vars
import { Request, Response } from "express";
import authInteractor from "../../../core/interactors/auth-interactor";

export async function signUpController(req: Request, res: Response) {
  res.status(501);
  let user = await authInteractor.signUp(req.body);
  res.json(user);
}
