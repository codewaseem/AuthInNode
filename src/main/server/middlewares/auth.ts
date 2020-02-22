import { check } from "express-validator";
import { onlyJSONContentType, handleValidatorErrors } from ".";
import { TokenExpiredOrInvalid } from "../../../constants/strings";

export const signUpRequestValidator = [
  onlyJSONContentType,
  checkEmail(),
  checkPassword(),
  check("name", "Invalid Name.")
    .exists()
    .notEmpty()
    .matches(/[a-zA-z\s+]{2,}/)
    .trim()
    .isLength({ min: 2, max: 24 })
    .customSanitizer((name: string) => {
      return name.split(/\s+/gm).join(" ");
    }),
  handleValidatorErrors,
];

export const loginRequestValidator = [
  onlyJSONContentType,
  checkEmail(),
  checkPassword(),
  handleValidatorErrors,
];

export const resetPasswordValidator = [
  onlyJSONContentType,
  checkEmail(),
  handleValidatorErrors,
];

export const setPasswordValidator = [
  onlyJSONContentType,
  check("token", TokenExpiredOrInvalid).notEmpty(),
  checkPassword(),
  handleValidatorErrors,
];

function checkPassword() {
  return check("password")
    .matches(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/
    )
    .withMessage("Invalid Password.");
}

function checkEmail() {
  return check("email")
    .isEmail()
    .withMessage("Invalid Email.")
    .normalizeEmail();
}
