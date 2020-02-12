import { check } from "express-validator";
import { Strings } from "../../constants/strings";
import { onlyJSONContentType, handleValidatorErrors } from ".";

export const signUpRequestValidator = [
  onlyJSONContentType,
  check("email")
    .isEmail()
    .withMessage(Strings.Invalid_Email)
    .normalizeEmail(),
  check("password")
    .matches(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/
    )
    .withMessage(Strings.Invalid_Password),
  check("name", Strings.InvalidName)
    .exists()
    .notEmpty()
    .matches(/[a-zA-z\s+]{2,}/)
    .trim()
    .isLength({ min: 2, max: 24 })
    .customSanitizer((name: string) => {
      return name.split(/\s+/gm).join(" ");
    }),
  // .isLength({ max: 16 })
  // .withMessage("Maximu"),
  handleValidatorErrors,
];
