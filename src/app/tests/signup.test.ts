import AuthInteractor from "../interactors/auth-interactor";
import { sample } from "lodash";
import { LoginStrategy } from "../constants";
import UserDBGateway from "../database/UserDBGateway";

jest.mock("../database/UserDBGateway");
let userDbGateway = new UserDBGateway();

let testsData = {
  goodEmails: ["waseem@gmail.com", "waseem76429@gmail.com"],
  badEmails: ["waseem@gm", "waseem.ha@gm.c"],
  goodPasswords: ["Catcat123#", "Jamiya@123", "kljaf@126L"],
  badPasswords: ["123465789", "abcdefghijk", "21213", "126456andjk"],
  badNames: ["", "  1", "123", "d123", "asdfhjkle hjldjhgftw hdjilkd"],
  goodNames: [" bob   martin"],
};

describe("AuthInteractor: SignUp Flow: Local Strategy", () => {
  let authInteractor: AuthInteractor;
  beforeEach(() => {
    authInteractor = new AuthInteractor(userDbGateway);
  });

  test("signup: should throw an error if email is invalid", async () => {
    expect.assertions(testsData.badEmails.length);
    for (let badEmail of testsData.badEmails)
      try {
        await authInteractor.signup({
          email: sample(badEmail) || "",
          name: sample(testsData.goodNames) || "",
          loginStrategy: LoginStrategy.Local,
        });
      } catch (e) {
        expect(e).toMatch("Invalid Email");
      }
  });

  test("signup: should throw an error if name is invalid", async () => {
    expect.assertions(testsData.badNames.length);
    for (let badName of testsData.badNames)
      try {
        await authInteractor.signup({
          email: sample(testsData.goodEmails) || "",
          name: badName,
          loginStrategy: LoginStrategy.Local,
        });
      } catch (e) {
        expect(e).toMatch("Invalid Name.");
      }
  });

  test("signup: if login strategy is local, then password should be specified else throw error", async () => {
    expect.assertions(1);
    try {
      await authInteractor.signup({
        email: sample(testsData.goodEmails) || "",
        name: sample(testsData.goodNames) || "",
        loginStrategy: LoginStrategy.Local,
      });
    } catch (e) {
      expect(e).toMatch("Invalid Password.");
    }
  });

  test(`signup: password should be of atleast 8 chars long having atleast 1 small, 
          1 big, 1 number, and 1 special char`, async () => {
    expect.assertions(testsData.badPasswords.length);
    for (let badPassword of testsData.badPasswords)
      try {
        await authInteractor.signup({
          email: sample(testsData.goodEmails) || "",
          name: sample(testsData.goodNames) || "",
          loginStrategy: LoginStrategy.Local,
          password: badPassword,
        });
      } catch (e) {
        expect(e).toMatch("Invalid Password.");
      }
  });

  test(`signup: when loginStrategy is other than local, password can be empty`, async () => {
    expect.assertions(1);

    await expect(
      authInteractor.signup.bind(authInteractor, {
        email: sample(testsData.goodEmails) || "",
        name: sample(testsData.goodNames) || "",
        loginStrategy: LoginStrategy.GitHub,
      })
    ).not.toThrow();
  });

  test(`should return newly created user when correct inputs are provided`, async () => {
    await authInteractor.signup({
      email: sample(testsData.goodEmails) || "",
      name: sample(testsData.goodNames) || "",
      loginStrategy: LoginStrategy.Local || "",
      password: sample(testsData.goodPasswords) || "",
    });

    expect(userDbGateway.addUser).toHaveBeenCalled();
    expect(userDbGateway.addUser).toHaveBeenCalledWith({
      email: expect.any(String),
      name: expect.any(String),
      loginStrategy: LoginStrategy.Local,
      password: expect.any(String),
    });
  });
});
