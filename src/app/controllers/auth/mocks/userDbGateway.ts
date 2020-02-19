// eslint-disable-next-line no-unused-vars
import { UserDBGateway } from "../../../interfaces";

type Mockify<T> = {
  [P in keyof T]: jest.Mock<{}>;
};
let userDbGateway: Mockify<UserDBGateway> = {
  addUser: jest.fn(),
  getUserByEmailAndPassword: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
};

export default userDbGateway as any;
