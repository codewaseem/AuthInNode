import validator from "validator";
// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User, OAuthData } from "../../interfaces";
import EMailer from "../mail";
import TokenController from "../tokens";
import {
  InvalidPassword,
  UserAlreadyExists,
  InvalidName,
  InvalidEmail,
  TokenExpiredOrInvalid,
  EmailAndPasswordMismatch,
  InvalidUserData,
  InvalidLoginStrategy,
} from "../../constants/errors";
import { LoginStrategy } from "../../constants";

class AuthInteractor {
  private userDbGateway: UserDBGateway;

  constructor(userDbGateway: UserDBGateway) {
    this.userDbGateway = userDbGateway;
  }

  async createAndLogin(
    signUpData: OAuthData
  ): Promise<{ user: User; token: string }> {
    let normalizedEmail = validator.normalizeEmail(signUpData.email) || "";
    let name = this.sanitizeName(signUpData.name);
    this.validateOAuthData(normalizedEmail, name, signUpData.loginStrategy);

    let user = await this.userDbGateway.getUserByEmail(normalizedEmail);
    if (user) return this.generateLoginData(user);

    let newUser = await this.saveUserToDB({ ...signUpData, password: "" });

    return this.generateLoginData(newUser);
  }

  private validateOAuthData(
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

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    let normalizedEmail = validator.normalizeEmail(email) || "";
    this.validateLoginData(normalizedEmail, password);
    let user = await this.getUserWithEmailAndPassword(
      normalizedEmail,
      password
    );
    return this.generateLoginData(user);
  }

  private generateLoginData(user: User): { user: User; token: string } {
    return {
      user,
      token: TokenController.generateToken(
        {
          userId: user.id,
        },
        { expiresIn: "7d" }
      ),
    };
  }

  private async getUserWithEmailAndPassword(
    normalizedEmail: string,
    password: string
  ) {
    let user = await this.userDbGateway.getUserByEmailAndPassword(
      normalizedEmail,
      password
    );
    if (!user) throw EmailAndPasswordMismatch;
    return user;
  }

  private validateLoginData(normalizedEmail: string, password: string) {
    this.validateEmail(normalizedEmail);
    this.validatePassword(password);
  }

  async activateUser(token: string): Promise<void> {
    try {
      let userData = this.verifyToken(token);
      this.saveUserToDB(userData);
    } catch (e) {
      throw TokenExpiredOrInvalid;
    }
  }

  private async saveUserToDB(userData: SignUpData) {
    return await this.userDbGateway.addUser({
      ...userData,
      loginStrategy: LoginStrategy.Local,
    });
  }

  private verifyToken(token: string) {
    let userData = TokenController.verify(token) as SignUpData;
    if (
      !userData ||
      typeof userData != "object" ||
      !userData.email ||
      !userData.name ||
      !userData.password
    )
      throw TokenExpiredOrInvalid;
    return userData;
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
