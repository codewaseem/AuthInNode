import AuthInteractor from "..";
import {
  InvalidEmail,
  UserDoesNotExists,
  OnlyLocalUsersCanResetPassword,
  TokenExpiredOrInvalid,
} from "../../../../constants/strings";
import userDbGateway from "../mocks/userDbGateway";
import AuthMailer from "../mocks/AuthMailer";
import { LoginStrategy } from "../../../../constants";

let testEmail = "codewaseem@gmail.com";
let nonLocalEmail = "nonlocal@gmail.com";

userDbGateway.getUserByEmail = jest.fn((email) => {
  if (email == testEmail) {
    return Promise.resolve({
      id: "1",
      email,
      loginStrategy: LoginStrategy.Local,
    } as any);
  } else if (email == nonLocalEmail) {
    return Promise.resolve({
      id: "2",
      email,
      loginStrategy: LoginStrategy.Google,
    });
  }
  return Promise.resolve(null);
});

describe("Reset password flow", () => {
  let authInteractor: AuthInteractor;

  beforeEach(() => {
    authInteractor = new AuthInteractor({
      userDbGateway,
      authMailer: AuthMailer,
    });
  });

  test("invalid email should throw an error", async () => {
    expect.assertions(1);
    try {
      await authInteractor.resetPasswordRequest("testEmail@gma");
    } catch (e) {
      expect(e).toMatch(InvalidEmail);
    }
  });

  test("non user email should throw an error", async () => {
    expect.assertions(1);
    try {
      await authInteractor.resetPasswordRequest("somerandom@email.com");
    } catch (e) {
      expect(e).toMatch(UserDoesNotExists);
    }
  });

  test("only users with local strategy can request for password reset", async () => {
    expect.assertions(1);
    try {
      await authInteractor.resetPasswordRequest(nonLocalEmail);
    } catch (e) {
      expect(e).toMatch(OnlyLocalUsersCanResetPassword);
    }
  });

  test("existing user should have mail sent to his email with token", async () => {
    await authInteractor.resetPasswordRequest(testEmail);
    expect(AuthMailer.sendPasswordResetLink).toHaveBeenCalled();
    expect(AuthMailer.sendPasswordResetLink).toHaveBeenCalledWith(
      testEmail,
      expect.any(String)
    );
  });

  describe("after password reset request, user can set new password", () => {
    test("should throw if the token is invalid", async () => {
      expect.assertions(1);
      try {
        await authInteractor.setNewPassword("someinvalidtoken");
      } catch (e) {
        expect(e).toMatch(TokenExpiredOrInvalid);
      }
    });

    test("should reset password, if token is valid", async () => {
      await authInteractor.resetPasswordRequest(testEmail);
      let token = (AuthMailer.sendPasswordResetLink as jest.Mock).mock
        .calls[0][1];
      await authInteractor.setNewPassword(token, "newPassword");
    });
  });
});
