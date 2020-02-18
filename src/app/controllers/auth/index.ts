import validator from "validator";
import { LoginStrategy } from "../../constants";
// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User } from "../../interfaces";

class AuthInteractor {
  private userDbGateway: UserDBGateway;

  constructor(userDbGateway: UserDBGateway) {
    this.userDbGateway = userDbGateway;
  }

  async signup(signUpData: SignUpData): Promise<User> {
    let sanitizedName = this.sanitizeName(signUpData.name);
    let normalizedEmail = validator.normalizeEmail(signUpData.email) || "";
    this.validateSignUpData(
      normalizedEmail,
      sanitizedName,
      signUpData.loginStrategy,
      signUpData.password
    );

    return this.userDbGateway.addUser(signUpData);
  }

  private validateSignUpData(
    normalizedEmail: string,
    sanitizedName: string,
    loginStrategy: LoginStrategy,
    password: string | undefined
  ) {
    this.validateEmail(normalizedEmail);
    this.validateName(sanitizedName);
    this.validatePassword(loginStrategy, password);
  }

  private validatePassword(
    loginStrategy: LoginStrategy,
    password: string | undefined
  ) {
    if (
      loginStrategy == LoginStrategy.Local &&
      (!password ||
        !validator.matches(
          password,
          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/
        ))
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
