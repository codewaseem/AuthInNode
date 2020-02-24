import AuthInteractor from "..";
import {
  InvalidEmail,
  UserDoesNotExists,
  OnlyLocalUsersCanResetPassword,
  TokenExpiredOrInvalid,
  InvalidPassword,
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
      password: "oldPassword",
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

userDbGateway.updatePassword = jest.fn((id, newPassword) => {
  if (id == "1")
    return Promise.resolve({
      id: "1",
      loginStrategy: LoginStrategy.Local,
      password: newPassword,
    } as any);
  return Promise.resolve(null);
});

describe("Reset password flow", () => {
  let authInteractor: AuthInteractor;

  beforeEach(() => {
    authInteractor = new AuthInteractor({
      userDbGateway,
      authMailer: AuthMailer as any,
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
        await authInteractor.setNewPassword("someinvalidtoken", "newPassword");
      } catch (e) {
        expect(e).toMatch(TokenExpiredOrInvalid);
      }
    });

    test("should throw error if password in invalid i.e does not meet criteria", async () => {
      expect.assertions(1);
      let token = await getResetPasswordToken(authInteractor);
      try {
        await authInteractor.setNewPassword(token, "newPassword");
      } catch (e) {
        expect(e).toMatch(InvalidPassword);
      }
    });
    test("should update the password provided valid token and password", async () => {
      let token = await getResetPasswordToken(authInteractor);
      let updatedUser = await authInteractor.setNewPassword(token, "AtestP@55");
      expect(userDbGateway.updatePassword).toHaveBeenCalledWith(
        "1",
        "AtestP@55"
      );
      expect((updatedUser as any).password).toBe("AtestP@55");
    });
  });
});
async function getResetPasswordToken(authInteractor: AuthInteractor) {
  await authInteractor.resetPasswordRequest(testEmail);
  let token = (AuthMailer.sendPasswordResetLink as jest.Mock).mock.calls[0][1];
  return token;
}
