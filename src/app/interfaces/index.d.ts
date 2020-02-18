// eslint-disable-next-line no-unused-vars
import { LoginStrategy } from "../constants";

declare interface SignUpData {
  email: string;
  name: string;
  loginStrategy: LoginStrategy;
  password?: string;
}

declare interface User {
  id: string;
  email: string;
  name: string;
  loginStrategy: LoginStrategy;
}

declare interface UserDBGateway {
  addUser(data: SignUpData): Promise<User>;
}
