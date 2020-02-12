import { Request, Response } from "express";

export const signUpController: (req: Request, res: Response) => any = jest.fn(
  (req, res) => {
    res.end();
  }
);

export default {
  signUpController,
};
