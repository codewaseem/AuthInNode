import request from "supertest";
import app from "../app";
// eslint-disable-next-line no-unused-vars
import express from "express";
import { sample } from "lodash";
import { startDB, stopDB } from "../../database/tests/testDBConnector";
import EMailer from "../../mail";
import { ResponseStatus } from "../../../constants";
// eslint-disable-next-line no-unused-vars
import { SignUpData } from "../../../app/interfaces";
import {
  InvalidEmail,
  InvalidName,
  InvalidPassword,
  TokenExpiredOrInvalid,
  UserAlreadyExists,
  FailedToSaveUserError,
} from "../../../constants/errors";

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

describe("Auth route:", () => {
  let signupEndpoint = `/auth/signup`;
  let activateEndpoint = `/auth/activate`;

  beforeAll(async () => {
    await startDB();
  });

  describe("/auth/signup endpoint", () => {
    test("invalid content type (data other than json) should respond with 415 error", async () => {
      let emptyDataResponse = await request(app)
        .post(signupEndpoint)
        .send();

      expect(emptyDataResponse.status).toBe(415);

      let stringDataResponse = await request(app)
        .post(signupEndpoint)
        .send("text");

      expect(stringDataResponse.status).toBe(415);
    });

    test("should respond with 422, given invalid email", async () => {
      let badEmailResponse = await request(app)
        .post(signupEndpoint)
        .send({
          email: sample(testsData.badEmails),
        } as SignUpData);

      expect(badEmailResponse.status).toBe(422);
      expect(badEmailResponse.body).toMatchObject({
        status: ResponseStatus.Error,
        message: InvalidEmail,
      });
    });

    test("should respond with 422, given invalid name", async () => {
      let badNameResponse = await request(app)
        .post(signupEndpoint)
        .send({
          email: sample(testsData.goodEmails),
          name: sample(testsData.badNames),
          password: sample(testsData.goodPasswords),
        });

      expect(badNameResponse).toMatchObject({
        status: 422,
        body: {
          status: ResponseStatus.Error,
          message: InvalidName,
        },
      });
    });

    test("should respond with 422, given invalid password", async () => {
      let badPasswordResponse = await request(app)
        .post(signupEndpoint)
        .send({
          email: sample(testsData.goodEmails),
          name: sample(testsData.goodNames),
          password: sample(testsData.badPasswords),
        });

      expect(badPasswordResponse).toMatchObject({
        status: 422,
        body: {
          status: ResponseStatus.Error,
          message: InvalidPassword,
        },
      });
    });

    test("should respond with 200 when data is valid", async () => {
      let response = await request(app)
        .post("/auth/signup")
        .send({
          email: "codewaseem@gmail.com",
          password: "ATestP@5SW0rd",
          name: "waseem ahmed",
        });
      expect(response.body).toMatchObject({
        status: ResponseStatus.Success,
        message: expect.stringContaining(`codewaseem@gmail.com`),
      });
    });
  });

  describe("/auth/activate endpoint", () => {
    test("should respond with 400, given invalid token", async () => {
      let token = sample(invalidTokens);
      let response = await request(app)
        .post(activateEndpoint)
        .send({
          token,
        });

      expect(response).toMatchObject({
        status: 400,
        body: { status: ResponseStatus.Error, message: TokenExpiredOrInvalid },
      });
    });

    test("should respond with 200, given valid token", async () => {
      let token = await signUp(signupEndpoint);

      let response = await activate(activateEndpoint, token);

      expect(response).toMatchObject({
        status: 200,
        body: {
          status: ResponseStatus.Success,
        },
      });
    });

    test("should respond with an error when existing users tries to sign up", async () => {
      let response = await request(app)
        .post(signupEndpoint)
        .send({
          email: "codewaseem@gmail.com",
          password: "ATestP@5SW0rd",
          name: "waseem ahmed",
        });

      expect(response).toMatchObject({
        status: 400,
        body: {
          status: ResponseStatus.Error,
          message: UserAlreadyExists,
        },
      });
    });

    test("should respond with an error when existing user tries to active again", async () => {
      let token = await signUp(signupEndpoint);

      let response = await activate(activateEndpoint, token);
      expect(response).toMatchObject({
        status: 400,
        body: {
          status: ResponseStatus.Error,
          message: FailedToSaveUserError,
        },
      });
    });
  });

  afterAll(async () => {
    await stopDB();
  });
});

async function activate(activateEndpoint: string, token: any) {
  return await request(app)
    .post(activateEndpoint)
    .send({
      token,
    });
}

async function signUp(signupEndpoint: string) {
  await request(app)
    .post(signupEndpoint)
    .send({
      email: "codewaseem@gmail.com",
      password: "ATestP@5SW0rd",
      name: "waseem ahmed",
    });
  let token = (EMailer.sendSignUpConfirmation as jest.Mock).mock.calls[0][1];
  return token;
}
