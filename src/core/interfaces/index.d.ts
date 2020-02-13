interface SignUpData {
  email: string;
  password: string;
  name: string;
  [key: string]: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  resetPasswordLink?: string;
  [key: string]: any;
}
interface AuthController {
  signUp(signUpData: SignUpData): Promise<User>;
}

interface AuthDBGateway {
  addUser(signUpData: SignUpData): Promise<User>;
  getUserByEmail(): Promise<User>;
  getUserById(): Promise<User>;
}
