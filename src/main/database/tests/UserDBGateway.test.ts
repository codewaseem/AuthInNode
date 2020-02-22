import UserGateway from "../UserDBGateway";
import {
  UserAlreadyExists,
  FailedToUpdatePassword,
} from "../../../constants/strings";
import { startDB, stopDB } from "./testDBConnector";
// eslint-disable-next-line no-unused-vars
import { User } from "../../../app/interfaces";

describe("User Entity", () => {
  let userGateway: UserGateway;
  beforeAll(async () => {
    await startDB();
  });

  beforeEach(async () => {
    userGateway = new UserGateway();
  });

  describe("Adding new user and getting the same user back", () => {
    let id: string = "";

    let { email, password, name } = {
      email: "waseem@gmail.com",
      password: "AGoodP@55Word",
      name: "Waseem Ahmed",
    };
    test("addUser(): should be able to add a new user", async () => {
      let user = await userGateway.addUser({
        name,
        email,
        password,
      });
      expect(user.id).toBeDefined();
      expect(user.name).toBe("Waseem Ahmed");

      id = user.id;
    });

    test("addUser(): should throw an error when adding same user twice", async () => {
      expect.assertions(1);
      try {
        await userGateway.addUser({
          name,
          email,
          password,
        });
        await userGateway.addUser({
          name,
          email,
          password,
        });
      } catch (e) {
        expect(e).toMatch(UserAlreadyExists);
      }
    });

    test("getUserById(): should be able to get back the user by id", async () => {
      let user = (await userGateway.getUserById(id)) as User;
      expect(user.id).toStrictEqual(id);
    });

    test("getUserByEmail(): should get the user by email", async () => {
      let user = await userGateway.getUserByEmail(email);
      expect(user?.email).toBe(email);
    });

    test("getUserByEmailAndPassword(): should get the user by email and correct password", async () => {
      let user = await userGateway.getUserByEmailAndPassword(email, password);
      expect(user).toBeDefined();
    });

    test("getUserByEmailAndPassword: should return null, if email and password mismatch", async () => {
      expect.assertions(2);
      let user = await userGateway.getUserByEmailAndPassword(
        email,
        "wrongPass#word32"
      );

      expect(user).toBeNull();

      let user2 = await userGateway.getUserByEmailAndPassword(
        "waseem@gmailnott.com",
        password
      );

      expect(user2).toBeNull();
    });

    test("updating password with invalid id should throw an error", async () => {
      expect.assertions(1);
      try {
        await userGateway.updatePassword("id", "n3WP@55word");
      } catch (e) {
        expect(e).toMatch(FailedToUpdatePassword);
      }
    });

    test("updating password with valid id should update the password", async () => {
      let user = await userGateway.updatePassword(id, "n3WP@55word");
      expect(user).toBeDefined();
    });
  });

  afterAll(async () => {
    await stopDB();
  });
});
