import AuthInteractor from "..";
import {
  EmailAndPasswordMismatch,
  InvalidEmail,
  InvalidPassword,
} from "../../../constants/errors";
import userDbGateway from "../mocks/userDbGateway";

let testEmail = "codewaseem@gmail.com";
let testPassword = "AtestP@55Word";

userDbGateway.getUserByEmailAndPassword = jest.fn((email, password) => {
  if (email == testEmail && password == testPassword) {
    return Promise.resolve({
      email,
      password,
    } as any);
  }
  return Promise.resolve(null);
});

describe("login", () => {
  let authInteractor: AuthInteractor;

  beforeEach(() => {
    authInteractor = new AuthInteractor(userDbGateway);
  });
  test("login method should exist", async () => {
    expect(authInteractor.login).toBeDefined();
  });

  test("login(): should throw an error if email is invalid", async () => {
    expect.assertions(1);
    try {
      await authInteractor.login("waseem.ha@gm.c", testPassword);
    } catch (e) {
      expect(e).toMatch(InvalidEmail);
    }
  });

  test("login(): should throw an error if password is invalid", async () => {
    expect.assertions(1);
    try {
      await authInteractor.login(testEmail, "abadpassword");
    } catch (e) {
      expect(e).toMatch(InvalidPassword);
    }
  });

  test("login(): should throw an error if email and password match not found", async () => {
    expect.assertions(1);
    try {
      await authInteractor.login("randomeEmail@gmail.com", testPassword);
    } catch (e) {
      expect(e).toMatch(EmailAndPasswordMismatch);
    }
  });

  test("login(): should return user and token if email and password match found", async () => {
    expect.assertions(1);
    let data = await authInteractor.login(testEmail, testPassword);
    expect(data).toMatchObject({
      user: expect.objectContaining({
        email: testEmail,
      }),
      token: expect.any(String),
    });
  });
});
