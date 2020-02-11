import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { Strings } from "../constants/strings";
// import {} from "express-validator";

export const signUpRequestValidator = [
  (req: Request, res: Response, next: NextFunction) => {
    if (req.headers["content-type"] != "application/json") {
      return res.status(415).end();
    }
    next();
  },
  check("email")
    .isEmail()
    .withMessage(Strings.Invalid_Email),
  check("password")
    .matches(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/
    )
    .withMessage(Strings.Invalid_Password),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg });
    }
    next();
  },
];
