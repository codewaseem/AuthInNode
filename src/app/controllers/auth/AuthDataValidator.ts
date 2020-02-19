import validator from "validator";
import {
  InvalidPassword,
  InvalidName,
  InvalidEmail,
  InvalidUserData,
  InvalidLoginStrategy,
} from "../../constants/errors";
import { LoginStrategy } from "../../constants";

export default class AuthDataValidator {
  validateOAuthData(
    normalizedEmail: string,
    name: string,
    loginStrategy: string
  ) {
    try {
      this.validateEmail(normalizedEmail);
      this.validateName(name);
      if (!loginStrategy || loginStrategy == LoginStrategy.Local) {
        throw InvalidLoginStrategy;
      }
    } catch (e) {
      throw InvalidUserData;
    }
  }
  validateLoginData(normalizedEmail: string, password: string) {
    this.validateEmail(normalizedEmail);
    this.validatePassword(password);
  }
  validateSignUpData(
    normalizedEmail: string,
    sanitizedName: string,
    password: string
  ) {
    this.validateEmail(normalizedEmail);
    this.validateName(sanitizedName);
    this.validatePassword(password);
  }
  validatePassword(password: string) {
    if (
      !password ||
      !validator.matches(
        password,
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/
      )
    ) {
      throw InvalidPassword;
    }
  }
  validateName(sanitizedName: string) {
    if (
      !validator.matches(sanitizedName, /[a-zA-z\s]{2,24}/) ||
      !validator.isLength(sanitizedName, { min: 2, max: 24 })
    ) {
      throw InvalidName;
    }
  }
  validateEmail(normalizedEmail: string) {
    if (!validator.isEmail(normalizedEmail)) {
      throw InvalidEmail;
    }
  }
}
