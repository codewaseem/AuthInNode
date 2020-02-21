// eslint-disable-next-line no-unused-vars
import { Response } from "express";
import { ResponseStatus } from "../../../constants";

export function sendSuccessResponse(
  res: Response,
  {
    message = "done",
    data = null,
    statusCode = 200,
  }: {
    message?: string;
    data?: object | any;
    statusCode?: number;
  }
) {
  res.status(statusCode).json({
    status: ResponseStatus.Success,
    message,
    data,
  });
}

export function sendErrorResponse(
  res: Response,
  {
    message = "failed",
    data = null,
    statusCode = 400,
  }: {
    message?: string;
    data?: object | any;
    statusCode?: number;
  }
) {
  res.status(statusCode).json({
    status: ResponseStatus.Error,
    message,
    data,
  });
}
