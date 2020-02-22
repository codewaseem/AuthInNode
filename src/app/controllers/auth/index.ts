import {
  // eslint-disable-next-line no-unused-vars
  UserDBGateway,
  // eslint-disable-next-line no-unused-vars
  SignUpData,
  // eslint-disable-next-line no-unused-vars
  User,
  // eslint-disable-next-line no-unused-vars
  OAuthData,
  // eslint-disable-next-line no-unused-vars
  AuthMailer,
} from "../../interfaces";
import TokenController from "../tokens";
import {
  UserAlreadyExists,
  TokenExpiredOrInvalid,
  EmailAndPasswordMismatch,
  FailedToSaveUserError,
  UserDoesNotExists,
  OnlyLocalUsersCanResetPassword,
} from "../../../constants/strings";
import { LoginStrategy } from "../../../constants";
import AuthDataValidator from "./AuthDataValidator";

class AuthInteractor {
  private userDbGateway: UserDBGateway;
  private inputValidator: AuthDataValidator;
  private authMailer: AuthMailer;

  constructor({
    userDbGateway,
    authMailer,
  }: {
    userDbGateway: UserDBGateway;
    authMailer: AuthMailer;
  }) {
    this.userDbGateway = userDbGateway;
    this.authMailer = authMailer;
    this.inputValidator = new AuthDataValidator();
  }

  async setNewPassword(token: string, newPassword: string) {
    let userId = this.verifyTokenForUserId(token);
    this.userDbGateway.updatePassword(userId, newPassword);
  }

  private async getUserById(userId: string) {
    return this.userDbGateway.getUserById(userId);
  }

  private verifyTokenForUserId(token: string) {
    try {
      let { userId } = TokenController.verify(token) as { userId: string };
      return userId;
    } catch (e) {
      throw TokenExpiredOrInvalid;
    }
  }

  async resetPasswordRequest(email: string) {
    let normalizedEmail = this.inputValidator.normalizeEmail(email);
    this.inputValidator.validateEmail(normalizedEmail);
    let user = await this.userDbGateway.getUserByEmail(normalizedEmail);
    if (!user) throw UserDoesNotExists;

    if (user.loginStrategy != LoginStrategy.Local)
      throw OnlyLocalUsersCanResetPassword;

    let token = TokenController.generateToken(
      {
        userId: user.id,
      },
      {
        expiresIn: "15m",
      }
    );
    this.authMailer.sendPasswordResetLink(normalizedEmail, token);
  }

  async oAuthLogin(
    signUpData: OAuthData
  ): Promise<{ user: User; token: string }> {
    let normalizedEmail = this.inputValidator.normalizeEmail(
      signUpData.email
    ) as string;
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
    let normalizedEmail = this.inputValidator.normalizeEmail(email) as string;
    this.inputValidator.validateLoginData(normalizedEmail, password);
    let user = await this.getUserWithEmailAndPassword(
      normalizedEmail,
      password
    );
    return this.generateLoginData(user);
  }

  async activateUser(token: string): Promise<void> {
    let userData = this.verifyToken(token);
    await this.saveUserToDB(userData);
  }

  async signup(signUpData: SignUpData): Promise<void> {
    let sanitizedName = this.sanitizeName(signUpData.name);
    let normalizedEmail = this.inputValidator.normalizeEmail(
      signUpData.email
    ) as string;

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
    return await this.saveUserToDB({ ...signUpData, password: "" }).catch(
      () => {
        throw FailedToSaveUserError;
      }
    );
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

  private async saveUserToDB(userData: SignUpData): Promise<User> {
    try {
      return await this.userDbGateway.addUser({
        ...userData,
        loginStrategy: userData.loginStrategy || LoginStrategy.Local,
      });
    } catch (e) {
      throw FailedToSaveUserError;
    }
  }

  private verifyToken(token: string) {
    try {
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
    } catch (e) {
      throw TokenExpiredOrInvalid;
    }
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
    await this.authMailer.sendSignUpConfirmation(email, token);
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
