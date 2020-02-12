import { Request, Response } from "express";

export function signUpController(req: Request, res: Response): any {
  res.status(501);
  res.json(req.body);
}
