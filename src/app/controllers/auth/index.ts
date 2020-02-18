import validator from "validator";
import { LoginStrategy } from "../../constants";
// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User } from "../../interfaces";
import EMailer from "../mail";
import TokenController from "../tokens";
import {
  InvalidPassword,
  UserAlreadyExists,
  InvalidName,
  InvalidEmail,
} from "../../constants/errors";

class AuthInteractor {
  private userDbGateway: UserDBGateway;

  constructor(userDbGateway: UserDBGateway) {
    this.userDbGateway = userDbGateway;
  }

  async signup(signUpData: SignUpData): Promise<void> {
    let sanitizedName = this.sanitizeName(signUpData.name);
    let normalizedEmail = validator.normalizeEmail(signUpData.email) || "";

    await this.checkForExistingUser(normalizedEmail);

    this.validateSignUpData(
      normalizedEmail,
      sanitizedName,
      signUpData.password
    );

    await this.sendConfirmationEmail(
      normalizedEmail,
      sanitizedName,
      signUpData.password
    );
  }

  private async sendConfirmationEmail(
    email: string,
    name: string,
    password: string
  ) {
    let token = TokenController.generateToken({
      email,
      name,
      password,
      loginStrategy: LoginStrategy.Local,
    });
    await EMailer.sendSignUpConfirmation(email, token);
  }

  private async checkForExistingUser(normalizedEmail: string) {
    let user = await this.userDbGateway.getUserByEmail(normalizedEmail);
    if (user) throw UserAlreadyExists;
  }

  private validateSignUpData(
    normalizedEmail: string,
    sanitizedName: string,
    password: string
  ) {
    this.validateEmail(normalizedEmail);
    this.validateName(sanitizedName);
    this.validatePassword(password);
  }

  private validatePassword(password: string) {
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

  private validateName(sanitizedName: string) {
    if (
      !validator.matches(sanitizedName, /[a-zA-z\s]{2,24}/) ||
      !validator.isLength(sanitizedName, { min: 2, max: 24 })
    ) {
      throw InvalidName;
    }
  }

  private validateEmail(normalizedEmail: string) {
    if (!validator.isEmail(normalizedEmail)) {
      throw InvalidEmail;
    }
  }

  private sanitizeName(name: string) {
    return name
      .trim()
      .split(/\s+/gm)
      .join(" ");
  }
}

export default AuthInteractor;
