class AuthInteractor implements AuthController {
  // eslint-disable-next-line no-unused-vars
  signUp(signUpData: SignUpData): Promise<User> {
    throw new Error("Method not implemented.");
  }
}

export default new AuthInteractor();
