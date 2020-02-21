import AuthInteractor from "..";
import userDbGateway from "../mocks/userDbGateway";
import AuthMailer from "../mocks/AuthMailer";

let invalidTokens = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNvZGV3YXNlZW1AZ21haWwuY29tIiwibmFtZSI6ImJvYiBtYXJ0aW4iLCJwYXNzd29yZCI6ImtsamFmQDEyNkwiLCJsb2dpblN0cmF0ZWd5IjoiTG9jYWwiLCJpYXQiOjE1ODIwMzk4ODYsImV4cCI6MTU4MjA0MDc4Nn0.pJPnxX0VDF56MMH8gpp-ggMVzqh9YLkUBdnyK9-yQrU",
  "eyJhbGciOiJIUzI1NiJ9..GoVh83btq100YruZDn5Qq5F_JRMARvXI19B9-Wx9sOk",
  "eyJhbGciOiJIUzI1NiJ9.ZGFmYQ._TD22AEUQ0bEZ0oV68lXOkpmzO4G1vXCU0kTIGZeYEI",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYWZhIjoiZHVmZiIsImlhdCI6MTU4MjA0MzAxMn0.LWn9D-qjvUoLAwik2fHEg-Z1CMVU6JfjGbtn4CYGT8o",
];

describe("activateUser", () => {
  let authInteractor: AuthInteractor;
  beforeEach(() => {
    authInteractor = new AuthInteractor({
      userDbGateway,
      authMailer: AuthMailer,
    });
  });

  test("activateUser should exists", () => {
    expect(authInteractor.activateUser).toBeDefined();
  });

  test("should throw an error when token is invalid", async () => {
    expect.assertions(invalidTokens.length);
    for (let invalidToken of invalidTokens)
      try {
        await authInteractor.activateUser(invalidToken);
      } catch (e) {
        expect(e).toBeDefined();
      }
  });

  test("should save the user to db when token is valid", async () => {
    expect.assertions(2);
    await authInteractor.signup({
      name: "Waseem Ahmed",
      email: "codewaseem@gmail.com",
      password: "AV3ry5tronGP@55",
    });

    let token = (AuthMailer.sendSignUpConfirmation as jest.Mock).mock
      .calls[0][1];

    authInteractor.activateUser(token);

    expect(userDbGateway.addUser).toHaveBeenCalled();
    expect(userDbGateway.addUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Waseem Ahmed",
        email: "codewaseem@gmail.com",
        password: "AV3ry5tronGP@55",
      })
    );
  });
});
