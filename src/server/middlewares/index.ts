import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function onlyJSONContentType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.headers["content-type"] != "application/json") {
    return res.status(415).end();
  }
  next();
}

export function handleValidatorErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }
  next();
}
