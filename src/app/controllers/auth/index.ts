import validator from "validator";
import { LoginStrategy } from "../../constants";
// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User } from "../../interfaces";
import EMailer from "../mail";
import TokenController from "../tokens";

class AuthInteractor {
  private userDbGateway: UserDBGateway;

  constructor(userDbGateway: UserDBGateway) {
    this.userDbGateway = userDbGateway;
  }

  async signup(signUpData: SignUpData): Promise<void> {
    let sanitizedName = this.sanitizeName(signUpData.name);
    let normalizedEmail = validator.normalizeEmail(signUpData.email) || "";

    let user = await this.userDbGateway.getUserByEmail(normalizedEmail);
    if (user) throw "User with given email already exists.";

    this.validateSignUpData(
      normalizedEmail,
      sanitizedName,
      signUpData.password
    );

    let token = TokenController.generateToken({
      email: normalizedEmail,
      name: sanitizedName,
      loginStrategy: LoginStrategy.Local,
      password: signUpData.password,
    });

    await EMailer.sendSignUpConfirmation(normalizedEmail, token);
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
      throw "Invalid Password.";
    }
  }

  private validateName(sanitizedName: string) {
    if (
      !validator.matches(sanitizedName, /[a-zA-z\s]{2,24}/) ||
      !validator.isLength(sanitizedName, { min: 2, max: 24 })
    ) {
      throw "Invalid Name.";
    }
  }

  private validateEmail(normalizedEmail: string) {
    if (!validator.isEmail(normalizedEmail)) {
      throw "Invalid Email.";
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
