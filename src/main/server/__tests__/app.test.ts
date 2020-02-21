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

describe("Auth route:", () => {
  beforeAll(async () => {
    await startDB();
  });

  describe("/auth/signup endpoint", () => {
    let signupEndpoint = `/auth/signup`;
    test("invalid content type (data other than json) should throw 415 error", async () => {
      let emptyDataResponse = await request(app)
        .post(signupEndpoint)
        .send();

      expect(emptyDataResponse.status).toBe(415);

      let stringDataResponse = await request(app)
        .post(signupEndpoint)
        .send("text");

      expect(stringDataResponse.status).toBe(415);
    });

    test("invalid email should throw invalid email error", async () => {
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

    test("should respond with 422, if name is invalid", async () => {
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

    test("should respond with 422, if password is invalid", async () => {
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

  afterAll(async () => {
    await stopDB();
  });
});
