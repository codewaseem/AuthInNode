import { check } from "express-validator";
import { Strings } from "../constants/strings";
import { onlyJSONContentType, handleValidatorErrors } from ".";
// import {} from "express-validator";

export const signUpRequestValidator = [
  onlyJSONContentType,
  check("email")
    .isEmail()
    .withMessage(Strings.Invalid_Email),
  check("password")
    .matches(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/
    )
    .withMessage(Strings.Invalid_Password),
  handleValidatorErrors,
];
