class AuthInteractor implements AuthController {
  signUp(signUpData: SignUpData): Promise<User> {
    throw new Error("Method not implemented.");
  }
}

export default new AuthInteractor();
