import request from "supertest";
import app from ".";
import { sample } from "lodash";
import { Strings } from "../constants/strings";
import authControllers from "../auth/controllers";

jest.mock("../auth/controllers");

const SIGNUP_ENDPOINT = "/auth/signup";
let testsData = {
  goodEmails: ["waseem@gmail.com", "waseem76429@gmail.com"],
  badEmails: ["waseem@gm", "waseem.ha@gm.c"],
  goodPasswords: ["Catcat123#", "Jamiya@123", "kljaf@126L"],
  badPasswords: ["123465789", "abcdefghijk", "21213", "126456andjk"],
  badNames: ["", "  1", "123", "d123", "asdfhjkle hjldjhgftw hdjilkd"],
  goodNames: [" bob   martin"],
};

describe(`Auth API: SignUp: ${SIGNUP_ENDPOINT}`, () => {
  test("should respond with 415, if the Content-Type: Header is set to other than application/json", async () => {
    let response = await makePostRequestToSignUp("text");
    expect(response.status).toBe(415);
  });

  test("should respond with 422 if email is not valid", async () => {
    let badEmailRequest = await makePostRequestToSignUp({
      email: sample(testsData.badEmails),
      password: sample(testsData.goodPasswords),
    });
    expect(badEmailRequest).toMatchObject({
      status: 422,
      body: { error: Strings.Invalid_Email },
    });

    let goodEmailRequest = await makePostRequestToSignUp({
      email: sample(testsData.goodEmails),
      password: sample(testsData.goodPasswords),
    });
    expect(goodEmailRequest).not.toMatchObject({
      status: 422,
      body: {
        error: Strings.Invalid_Email,
      },
    });
  });

  test("should respond with 422 if password is not valid", async () => {
    let badPasswordResponse = await makePostRequestToSignUp({
      email: sample(testsData.goodEmails),
      password: sample(testsData.badPasswords),
    });

    expect(badPasswordResponse).toMatchObject({
      status: 422,
      body: {
        error: Strings.Invalid_Password,
      },
    });

    let goodRequestResponse = await makePostRequestToSignUp({
      email: sample(testsData.goodEmails),
      password: sample(testsData.goodPasswords),
    });

    expect(goodRequestResponse).not.toMatchObject({
      status: 422,
      body: {
        error: Strings.Invalid_Password,
      },
    });
  });

  test("should respond with 422, if name is invalid", async () => {
    jest.unmock("../auth/controllers");

    let badNameRequestResponse = await makePostRequestToSignUp({
      email: sample(testsData.goodEmails),
      password: sample(testsData.goodPasswords),
      name: sample(testsData.badNames),
    });

    expect(badNameRequestResponse).toMatchObject({
      status: 422,
      body: {
        error: Strings.InvalidName,
      },
    });

    let goodNameRequestResponse = await makePostRequestToSignUp({
      email: sample(testsData.goodEmails),
      password: sample(testsData.goodPasswords),
      name: sample(testsData.goodNames),
    });

    expect(goodNameRequestResponse).not.toMatchObject({
      status: 422,
      body: {
        error: Strings.InvalidName,
      },
    });
  });

  test("name should be sanitized", async () => {
    let response = await makePostRequestToSignUp({
      email: sample(testsData.goodEmails),
      password: sample(testsData.goodPasswords),
      name: "  bob   martin   ss   ",
    });

    expect(
      (authControllers.signUpController as jest.Mock).mock.calls[0][0].body.name
    ).toBe("bob martin");
  });
});

function makePostRequestToSignUp(body: { [key: string]: any } | string) {
  return request(app)
    .post(SIGNUP_ENDPOINT)
    .send(body);
}
