import { MongoMemoryServer } from "mongodb-memory-server";
import DBConnector from "../DBConnector";
import UserGateway from "../UserDBGateway";
import { UserAlreadyExists } from "../../../constants/errors";

const mongoServer = new MongoMemoryServer();
let dbConnector = new DBConnector();

export async function startDB() {
  const uri = await mongoServer.getConnectionString();
  await dbConnector.start(uri);
}

export async function stopDB() {
  await dbConnector.stop();
  await mongoServer.stop();
}

describe("User Entity", () => {
  let userGateway: UserGateway;
  beforeAll(async () => {
    await startDB();
  });

  beforeEach(async () => {
    userGateway = new UserGateway();
  });

  test("UserGateway should exists", () => {
    expect(userGateway).toBeDefined();
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
      let user = await userGateway.getUserById(id);
      expect(user?.id).toBe(id);
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
  });

  afterAll(async () => {
    await stopDB();
  });
});
