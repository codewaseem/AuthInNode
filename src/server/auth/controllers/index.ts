import { Request, Response } from "express";

export const signUpController: (req: Request, res: Response) => any = function(
  req,
  res
) {
  res.status(501);
  res.json(req.body);
};

export default {
  signUpController,
};
