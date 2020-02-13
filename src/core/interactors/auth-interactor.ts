class AuthInteractor implements AuthController {
  private dbGateway!: AuthDBGateway;
  // eslint-disable-next-line no-unused-vars

  setDBGateway(dbGateway: AuthDBGateway) {
    this.dbGateway = dbGateway;
  }

  async signUp(signUpData: SignUpData): Promise<User> {
    this.checkDBGateway();
    return await this.dbGateway.addUser(signUpData);
  }

  private checkDBGateway() {
    if (!this.dbGateway) {
      throw new Error("Gateway not set.");
    }
  }
}

export default new AuthInteractor();
