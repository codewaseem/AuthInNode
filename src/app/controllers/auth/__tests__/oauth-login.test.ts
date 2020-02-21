import AuthInteractor from "..";
import { InvalidUserData } from "../../../../constants/strings";
import { LoginStrategy } from "../../../../constants";
import userDbGateway from "../mocks/userDbGateway";
import AuthMailer from "../mocks/AuthMailer";
let testEmail = "codewaseem@gmail.com";

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

describe("oAuthLogin", () => {
  let authInteractor: AuthInteractor;

  beforeEach(() => {
    authInteractor = new AuthInteractor({
      userDbGateway,
      authMailer: AuthMailer,
    });
  });

  test("oAuthLogin should exists", () => {
    expect(authInteractor.oAuthLogin).toBeDefined();
  });

  test("oAuthLogin should validate input data and throw error if invalid", async () => {
    expect.assertions(1);
    try {
      await authInteractor.oAuthLogin({
        email: "falksd",
        name: "waseem ahmed",
        loginStrategy: LoginStrategy.Google,
      });
    } catch (e) {
      expect(e).toMatch(InvalidUserData);
    }
  });

  test("oAuthLogin: existing user should be logged in", async () => {
    expect.assertions(1);
    let data = await authInteractor.oAuthLogin({
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

  test("oAuthLogin: if user does not exists, new  user should be created and logged in", async () => {
    expect.assertions(1);
    let data = await authInteractor.oAuthLogin({
      email: "newemail@gmai.com",
      name: "New Name",
      loginStrategy: LoginStrategy.Facebook,
    });
    expect(data).toMatchObject({
      user: expect.objectContaining({
        email: "newemail@gmai.com",
        name: "New Name",
        loginStrategy: LoginStrategy.Facebook,
      }),
      token: expect.any(String),
    });
  });

  test("providing local login strategy should throw an error", async () => {
    expect.assertions(1);
    try {
      await authInteractor.oAuthLogin({
        email: "newemail@gmail.com",
        name: "New Name",
        loginStrategy: LoginStrategy.Local,
      });
    } catch (e) {
      expect(e).toMatch(InvalidUserData);
    }
  });
});
