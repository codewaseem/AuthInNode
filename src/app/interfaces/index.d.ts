// eslint-disable-next-line no-unused-vars
import { LoginStrategy } from "../../constants";

declare interface SignUpData {
  email: string;
  name: string;
  password: string;
  loginStrategy?: string;
}

declare interface OAuthData {
  email: string;
  name: string;
  loginStrategy: string;
}

declare interface User {
  id: string;
  email: string;
  name: string;
  loginStrategy: LoginStrategy;
}

declare interface UserDBGateway {
  addUser(data: SignUpData): Promise<User>;
  updatePassword(id: string, newPassword: string): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User | null>;
}

declare interface AuthMailer {
  sendSignUpConfirmation(to: string, token: string): Promise<any>;
  sendPasswordResetLink(to: string, token: string): Promise<any>;
}
