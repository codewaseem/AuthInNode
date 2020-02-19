import validator from "validator";
// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User, OAuthData } from "../../interfaces";
import EMailer from "../mail";
import TokenController from "../tokens";
import {
  UserAlreadyExists,
  TokenExpiredOrInvalid,
  EmailAndPasswordMismatch,
} from "../../constants/errors";
import { LoginStrategy } from "../../constants";
import AuthDataValidator from "./AuthDataValidator";

class AuthInteractor {
  private userDbGateway: UserDBGateway;
  private inputValidator: AuthDataValidator;

  constructor(userDbGateway: UserDBGateway) {
    this.userDbGateway = userDbGateway;
    this.inputValidator = new AuthDataValidator();
  }

  async oAuthLogin(
    signUpData: OAuthData
  ): Promise<{ user: User; token: string }> {
    let normalizedEmail = validator.normalizeEmail(signUpData.email) || "";
    let name = this.sanitizeName(signUpData.name);
    this.validateOAuthData(normalizedEmail, name, signUpData);

    let user = await this.getExistingUser(normalizedEmail);
    if (!user) {
      user = await this.createNewUser(signUpData);
    }

    return this.generateLoginData(user);
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    let normalizedEmail = validator.normalizeEmail(email) || "";
    this.inputValidator.validateLoginData(normalizedEmail, password);
    let user = await this.getUserWithEmailAndPassword(
      normalizedEmail,
      password
    );
    return this.generateLoginData(user);
  }

  async activateUser(token: string): Promise<void> {
    try {
      let userData = this.verifyToken(token);
      this.saveUserToDB(userData);
    } catch (e) {
      throw TokenExpiredOrInvalid;
    }
  }

  async signup(signUpData: SignUpData): Promise<void> {
    let sanitizedName = this.sanitizeName(signUpData.name);
    let normalizedEmail = validator.normalizeEmail(signUpData.email) || "";

    await this.checkForExistingUser(normalizedEmail);

    this.inputValidator.validateSignUpData(
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

  private async createNewUser(signUpData: OAuthData) {
    return await this.saveUserToDB({ ...signUpData, password: "" });
  }

  private async getExistingUser(normalizedEmail: string) {
    return await this.userDbGateway.getUserByEmail(normalizedEmail);
  }

  private validateOAuthData(
    normalizedEmail: string,
    name: string,
    signUpData: OAuthData
  ) {
    this.inputValidator.validateOAuthData(
      normalizedEmail,
      name,
      signUpData.loginStrategy
    );
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

  private async saveUserToDB(userData: SignUpData) {
    return await this.userDbGateway.addUser({
      ...userData,
      loginStrategy: userData.loginStrategy || LoginStrategy.Local,
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

  private sanitizeName(name: string) {
    return name
      .trim()
      .split(/\s+/gm)
      .join(" ");
  }
}

export default AuthInteractor;
