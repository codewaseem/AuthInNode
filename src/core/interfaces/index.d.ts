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
}
interface AuthController {
  signUp(signUpData: SignUpData): Promise<User>;
}
