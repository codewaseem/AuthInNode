import request from "supertest";
import app from ".";
import { sample } from "lodash";
import { Strings } from "../constants/strings";

const SIGNUP_ENDPOINT = "/auth/signup";
let testsData = {
  goodEmails: ["waseem@gmail.com", "waseem76429@gmail.com"],
  badEmails: ["waseem@gm", "waseem.ha@gm.c"],
  goodPasswords: ["Catcat123#", "Jamiya@123", "kljaf@126L"],
  badPasswords: ["123465789", "abcdefghijk", "21213", "126456andjk"],
};

type RequestData = {
  url: string;
  body: { [key: string]: any };
};

describe(`Auth API: SignUp: ${SIGNUP_ENDPOINT}`, () => {
  test("should respond with 415, if the Content-Type: Header is set to other than application/json", async () => {
    let response = await request(app)
      .post(SIGNUP_ENDPOINT)
      .send("text");

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
});
function makePostRequestToSignUp(body: { [key: string]: any }) {
  return request(app)
    .post(SIGNUP_ENDPOINT)
    .send(body);
}
