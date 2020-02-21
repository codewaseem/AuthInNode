// eslint-disable-next-line no-unused-vars
import { AuthMailer } from "../../../interfaces";

type Mockify<T> = {
  [P in keyof T]: jest.Mock<{}>;
};
let AuthMailer: Mockify<AuthMailer> = {
  sendSignUpConfirmation: jest.fn(),
  sendPasswordResetLink: jest.fn(),
};

export default AuthMailer as any;
