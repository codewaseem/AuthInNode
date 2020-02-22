import request from "supertest";
import app from "../app";
import { sample } from "lodash";
import { startDB, stopDB } from "../../database/tests/testDBConnector";
import EMailer from "../../mail";
import { ResponseStatus } from "../../../constants";
import {
  InvalidEmail,
  InvalidName,
  InvalidPassword,
  TokenExpiredOrInvalid,
  UserAlreadyExists,
  FailedToSaveUserError,
  NewPasswordSetSuccessfully,
  UserDoesNotExists,
} from "../../../constants/strings";

jest.mock("../../mail");

let testsData = {
  goodEmails: ["waseem@gmail.com", "waseem76429@gmail.com"],
  badEmails: ["waseem@gm", "waseem.ha@gm.c"],
  goodPasswords: ["Catcat123#", "Jamiya@123", "kljaf@126L"],
  badPasswords: ["123465789", "abcdefghijk", "21213", "126456andjk"],
  badNames: ["", "  1", "123", "d123", "asdfhjkle hjldjhgftw hdjilkd"],
  goodNames: [" bob   martin"],
};

let invalidTokens = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNvZGV3YXNlZW1AZ21haWwuY29tIiwibmFtZSI6ImJvYiBtYXJ0aW4iLCJwYXNzd29yZCI6ImtsamFmQDEyNkwiLCJsb2dpblN0cmF0ZWd5IjoiTG9jYWwiLCJpYXQiOjE1ODIwMzk4ODYsImV4cCI6MTU4MjA0MDc4Nn0.pJPnxX0VDF56MMH8gpp-ggMVzqh9YLkUBdnyK9-yQrU",
  "eyJhbGciOiJIUzI1NiJ9..GoVh83btq100YruZDn5Qq5F_JRMARvXI19B9-Wx9sOk",
  "eyJhbGciOiJIUzI1NiJ9.ZGFmYQ._TD22AEUQ0bEZ0oV68lXOkpmzO4G1vXCU0kTIGZeYEI",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYWZhIjoiZHVmZiIsImlhdCI6MTU4MjA0MzAxMn0.LWn9D-qjvUoLAwik2fHEg-Z1CMVU6JfjGbtn4CYGT8o",
];

const validLocalSignUpData = {
  email: "codewaseem@gmail.com",
  password: "ATestP@5SW0rd",
  name: "waseem ahmed",
};
const newPassword = "AtestP@55";

const signupEndpoint = `/auth/signup`;
const activateEndpoint = `/auth/activate`;
const loginEndpiont = `/auth/login`;
const resetPasswordEndpoint = `/auth/reset-password`;
const setNewPasswordEndpoint = `/auth/set-password`;

const InvalidEmailResponse = {
  status: 422,
  body: {
    status: ResponseStatus.Error,
    message: InvalidEmail,
  },
};

const InvalidPasswordResponse = {
  status: 422,
  body: {
    status: ResponseStatus.Error,
    message: InvalidPassword,
  },
};

const InvalidTokenResponse = {
  status: expect.any(Number),
  body: {
    status: ResponseStatus.Error,
    message: TokenExpiredOrInvalid,
  },
};

describe("Auth route:", () => {
  beforeAll(async () => {
    await startDB();
  });

  describe("/auth/signup endpoint", () => {
    test("invalid content type (data other than json) should respond with 415 error", async () => {
      let emptyDataResponse = await makeSignUpRequest();
      expect(emptyDataResponse.status).toBe(415);

      let stringDataResponse = await makeSignUpRequest("text");

      expect(stringDataResponse.status).toBe(415);
    });

    test("should respond with 422, given invalid email", async () => {
      let badEmailResponse = await signUpRequestWithBadEmail();
      assertToMatchResponse(badEmailResponse, InvalidEmailResponse);
    });

    test("should respond with 422, given invalid name", async () => {
      let badNameResponse = await signUpRequestWithBadName();

      assertToMatchResponse(badNameResponse, {
        status: 422,
        body: {
          status: ResponseStatus.Error,
          message: InvalidName,
        },
      });
    });

    test("should respond with 422, given invalid password", async () => {
      let badPasswordResponse = await signUpRequestWithBadPassword();

      assertToMatchResponse(badPasswordResponse, InvalidPasswordResponse);
    });

    test("should respond with 200 when data is valid", async () => {
      let response = await makeSignUpRequest(validLocalSignUpData);
      assertToMatchResponse(response, {
        status: 200,
        body: {
          status: ResponseStatus.Success,
          message: expect.stringContaining(validLocalSignUpData.email),
        },
      });
    });
  });

  describe("/auth/activate endpoint", () => {
    test("should respond with 400, given invalid token", async () => {
      let response = await makeActivateUserRequest({
        token: sample(invalidTokens),
      });

      assertToMatchResponse(response, InvalidTokenResponse);
    });

    test("should respond with 200, given valid token", async () => {
      let token = await signUpAndGetToken();
      let response = await makeActivateUserRequest({ token });

      assertToMatchResponse(response, {
        status: 200,
        body: {
          status: ResponseStatus.Success,
        },
      });
    });

    test("should respond with an error when existing users tries to sign up", async () => {
      let response = await makeSignUpRequest(validLocalSignUpData);

      assertToMatchResponse(response, {
        status: 400,
        body: {
          status: ResponseStatus.Error,
          message: UserAlreadyExists,
        },
      });
    });

    test("should respond with an error when existing user tries to active again", async () => {
      let token = await signUpAndGetToken();
      let response = await makeActivateUserRequest({ token });

      assertToMatchResponse(response, {
        status: 400,
        body: {
          status: ResponseStatus.Error,
          message: FailedToSaveUserError,
        },
      });
    });
  });

  describe("/auth/login endpoint", () => {
    test("invalid email and password should respond with 415", async () => {
      let response = await makeLoginRequest({
        email: sample(testsData.badEmails),
        password: sample(testsData.goodPasswords),
      });

      assertToMatchResponse(response, InvalidEmailResponse);

      let response2 = await makeLoginRequest({
        email: sample(testsData.goodEmails),
        password: sample(testsData.badPasswords),
      });

      assertToMatchResponse(response2, InvalidPasswordResponse);
    });

    test("wrong username and password should respond with 400", async () => {
      let response = await makeLoginRequest({
        email: sample(testsData.goodEmails),
        password: sample(testsData.goodPasswords),
      });

      assertToMatchResponse(response, {
        status: 400,
        body: {
          status: ResponseStatus.Error,
        },
      });
    });

    test("valid email and password, should get the user info and login token back", async () => {
      let response = await makeLoginRequest(validLocalSignUpData);

      assertToMatchResponse(response, {
        status: 200,
        body: {
          status: ResponseStatus.Success,
          data: {
            user: expect.any(Object),
            token: expect.any(String),
          },
        },
      });
    });
  });

  describe("/auth/reset-password and /auth/set-password", () => {
    let token = "";

    test("should throw an error provided invalid email", async () => {
      let response = await makeResetPasswordRequest({ email: "invalid" });

      assertToMatchResponse(response, {
        status: 422,
        body: {
          message: InvalidEmail,
        },
      });
    });

    test("should respond with error if email of non-user is provided", async () => {
      let response = await makeResetPasswordRequest({
        email: "valid@email.com",
      });

      assertToMatchResponse(response, {
        status: 400,
        body: {
          message: UserDoesNotExists,
        },
      });
    });

    test("email should be sent to to reset password", async () => {
      let response = await makeResetPasswordRequest({
        email: validLocalSignUpData.email,
      });
      assertToMatchResponse(response, {
        status: 200,
        body: {
          status: ResponseStatus.Success,
          message: expect.any(String),
        },
      });
      expect(EMailer.sendPasswordResetLink).toHaveBeenCalledWith(
        validLocalSignUpData.email,
        expect.any(String)
      );
      token = (EMailer.sendPasswordResetLink as jest.Mock).mock.calls[0][1];
    });

    test("token and password should be provided", async () => {
      let response = await makeSetNewPasswordRequest({
        password: "somepassword",
      });

      assertToMatchResponse(response, InvalidTokenResponse);
    });

    test("should respond with error, when password criteria is invalid", async () => {
      let response = await makeSetNewPasswordRequest({
        token,
        password: sample(testsData.badPasswords),
      });

      assertToMatchResponse(response, InvalidPasswordResponse);
    });

    test("should respond with error, when invalid token is used to reset password", async () => {
      expect.assertions(1);

      let response = await makeSetNewPasswordRequest({
        token: sample(invalidTokens) as string,
        password: newPassword,
      });

      assertToMatchResponse(response, InvalidTokenResponse);
    });

    test("should reset to new password, when valid token and password provided", async () => {
      let response = await makeSetNewPasswordRequest({
        token,
        password: newPassword,
      });

      assertToMatchResponse(response, {
        status: 200,
        body: {
          status: ResponseStatus.Success,
          message: NewPasswordSetSuccessfully,
        },
      });

      let loginResponse = await request(app)
        .post(loginEndpiont)
        .send({
          email: validLocalSignUpData.email,
          password: newPassword,
        });

      assertToMatchResponse(loginResponse, {
        status: 200,
        body: {
          status: ResponseStatus.Success,
          data: {
            user: expect.any(Object),
            token: expect.any(String),
          },
        },
      });
    });
  });

  afterAll(async () => {
    await stopDB();
  });
});

/** Test Helper functions */

function makeLoginRequest(data: any) {
  return request(app)
    .post(loginEndpiont)
    .send(data);
}

function makeSignUpRequest(data?: any) {
  return request(app)
    .post(signupEndpoint)
    .send(data);
}

function makeActivateUserRequest(data?: any) {
  return request(app)
    .post(activateEndpoint)
    .send(data);
}

function makeResetPasswordRequest(data?: any) {
  return request(app)
    .post(resetPasswordEndpoint)
    .send(data);
}

function makeSetNewPasswordRequest(data?: any) {
  return request(app)
    .post(setNewPasswordEndpoint)
    .send(data);
}

async function signUpRequestWithBadPassword() {
  return await makeSignUpRequest({
    email: sample(testsData.goodEmails),
    name: sample(testsData.goodNames),
    password: sample(testsData.badPasswords),
  });
}

async function signUpRequestWithBadName() {
  return await makeSignUpRequest({
    email: sample(testsData.goodEmails),
    name: sample(testsData.badNames),
    password: sample(testsData.goodPasswords),
  });
}

async function signUpRequestWithBadEmail() {
  return await makeSignUpRequest({
    email: sample(testsData.badEmails),
  });
}

async function signUpAndGetToken() {
  await makeSignUpRequest(validLocalSignUpData);
  let token = (EMailer.sendSignUpConfirmation as jest.Mock).mock.calls[0][1];
  return token;
}

interface ResponseTestData {
  status: number;
  body: {
    status?: ResponseStatus;
    message?: string;
    data?: any;
  };
  [key: string]: any;
}

function assertToMatchResponse(
  recievedResponse: ResponseTestData,
  expectedResponse: ResponseTestData
) {
  expect(recievedResponse).toMatchObject(expectedResponse);
}
