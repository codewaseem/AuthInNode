import AuthInteractor from "..";
import { sample } from "lodash";
// eslint-disable-next-line no-unused-vars
import { User } from "../../../interfaces";
import {
  InvalidEmail,
  InvalidName,
  InvalidPassword,
  UserAlreadyExists,
} from "../../../../constants/strings";
import userDbGateway from "../mocks/userDbGateway";
import AuthMailer from "../mocks/AuthMailer";

let testsData = {
  goodEmails: ["waseem@gmail.com", "waseem76429@gmail.com"],
  badEmails: ["waseem@gm", "waseem.ha@gm.c"],
  goodPasswords: ["Catcat123#", "Jamiya@123", "kljaf@126L"],
  badPasswords: ["123465789", "abcdefghijk", "21213", "126456andjk"],
  badNames: ["", "  1", "123", "d123", "asdfhjkle hjldjhgftw hdjilkd"],
  goodNames: [" bob   martin"],
};

describe("AuthInteractor: signup with email and password", () => {
  let authInteractor: AuthInteractor;
  beforeEach(() => {
    authInteractor = new AuthInteractor({
      userDbGateway,
      authMailer: AuthMailer as any,
    });
  });

  test("signup: should throw an error if email is invalid", async () => {
    expect.assertions(testsData.badEmails.length);
    for (let badEmail of testsData.badEmails)
      try {
        await authInteractor.signup({
          email: sample(badEmail) as string,
          name: sample(testsData.goodNames) as string,
          password: sample(testsData.goodPasswords) as string,
        });
      } catch (e) {
        expect(e).toMatch(InvalidEmail);
      }
  });

  test("signup: should throw an error if name is invalid", async () => {
    expect.assertions(testsData.badNames.length);
    for (let badName of testsData.badNames)
      try {
        await authInteractor.signup({
          email: sample(testsData.goodEmails) as string,
          name: badName,
          password: sample(testsData.goodPasswords) as string,
        });
      } catch (e) {
        expect(e).toMatch(InvalidName);
      }
  });

  test(`signup: password should be of atleast 8 chars long having atleast 1 small, 
          1 big, 1 number, and 1 special char`, async () => {
    expect.assertions(testsData.badPasswords.length);
    for (let badPassword of testsData.badPasswords)
      try {
        await authInteractor.signup({
          email: sample(testsData.goodEmails) as string,
          name: sample(testsData.goodNames) as string,
          password: badPassword,
        });
      } catch (e) {
        expect(e).toMatch(InvalidPassword);
      }
  });

  test(`should throw an error if a user already exists with the given email`, async () => {
    userDbGateway.getUserByEmail = jest.fn((email: string) => {
      if (email == "signedupuser@email.com") {
        return Promise.resolve({
          email,
        } as User);
      }
      return Promise.resolve(null);
    });
    expect.assertions(1);
    try {
      await authInteractor.signup({
        email: "signedupuser@email.com",
        name: "Signed Up Already",
        password: sample(testsData.goodPasswords) as string,
      });
    } catch (e) {
      expect(e).toMatch(UserAlreadyExists);
    }
    userDbGateway.getUserByEmail = jest.fn();
  });

  test(`signup: should send confirmation email when the provided data is valid`, async () => {
    let email = "codewaseem@gmail.com";
    await authInteractor.signup({
      email,
      name: sample(testsData.goodNames) as string,
      password: sample(testsData.goodPasswords) as string,
    });

    expect(AuthMailer.sendSignUpConfirmation).toHaveBeenCalled();
    expect(AuthMailer.sendSignUpConfirmation).toHaveBeenCalledWith(
      email,
      expect.any(String)
    );
  });
});
