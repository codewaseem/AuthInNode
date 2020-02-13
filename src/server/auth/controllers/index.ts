// eslint-disable-next-line no-unused-vars
import { Request, Response } from "express";

export async function signUpController(req: Request, res: Response) {
  // let user = await authInteractor.signUp(req.body);
  res.json(req.body);
}
