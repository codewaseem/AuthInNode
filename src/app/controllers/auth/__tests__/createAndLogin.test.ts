import AuthInteractor from "..";
import UserDBGateway from "../../../database/UserDBGateway";
import { InvalidUserData } from "../../../constants/errors";
import { LoginStrategy } from "../../../constants";
jest.mock("../../../database/UserDBGateway");

let userDbGateway = new UserDBGateway();

let testEmail = "codewaseem@gmail.com";
let testPassword = "AtestP@55Word";

userDbGateway.getUserByEmail = jest.fn((email) => {
  if (email == testEmail) {
    return Promise.resolve({
      email,
    } as any);
  }
  return Promise.resolve(null);
});

userDbGateway.addUser = jest.fn((data) => {
  return Promise.resolve({ ...data, id: "1" } as any);
});

describe("createAndLogin", () => {
  let authInteractor: AuthInteractor;

  beforeEach(() => {
    authInteractor = new AuthInteractor(userDbGateway);
  });

  test("createAndLogin should exists", () => {
    expect(authInteractor.createAndLogin).toBeDefined();
  });

  test("createAndLogin should validate input data and throw error if invalid", async () => {
    expect.assertions(1);
    try {
      await authInteractor.createAndLogin({
        email: "falksd",
        name: "waseem ahmed",
        loginStrategy: LoginStrategy.Google,
      });
    } catch (e) {
      expect(e).toMatch(InvalidUserData);
    }
  });

  test("createAndLogin: existing user should be logged in", async () => {
    expect.assertions(1);
    let data = await authInteractor.createAndLogin({
      email: testEmail,
      name: "Test Name",
      loginStrategy: LoginStrategy.Google,
    });
    expect(data).toMatchObject({
      user: expect.objectContaining({
        email: testEmail,
      }),
      token: expect.any(String),
    });
  });

  test("createAndLogin: if user does not exists, new  user should be created and logged in", async () => {
    expect.assertions(1);
    let data = await authInteractor.createAndLogin({
      email: "newemail@gmai.com",
      name: "New Name",
      loginStrategy: LoginStrategy.Facebook,
    });
    expect(data).toMatchObject({
      user: expect.objectContaining({
        email: "newemail@gmai.com",
        name: "New Name",
      }),
      token: expect.any(String),
    });
  });
});
