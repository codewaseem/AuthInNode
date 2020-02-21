// eslint-disable-next-line no-unused-vars
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { sendErrorResponse } from "../helpers";

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
    return sendErrorResponse(res, {
      message: errors.array()[0].msg,
      statusCode: 422,
    });
  }
  next();
}
