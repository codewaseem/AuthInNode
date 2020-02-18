import { MongoMemoryServer } from "mongodb-memory-server";
import DBConnector from "../DBConnector";
import { LoginStrategy } from "../../constants";
import UserGateway from "../UserDBGateway";

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

    let { email, password, loginStrategy, name } = {
      email: "waseem@gmail.com",
      password: "AGoodP@55Word",
      loginStrategy: LoginStrategy.Local,
      name: "Waseem Ahmed",
    };
    test("addUser(): should be able to add a new user", async () => {
      let user = await userGateway.addUser({
        name,
        email,
        loginStrategy,
        password,
      });

      expect(user.id).toBeDefined();
      expect(user.name).toBe("Waseem Ahmed");

      id = user.id;
    });

    test("getUserById(): should be able to get back the user by id", async () => {
      let user = await userGateway.getUserById(id);
      expect(user?.id).toBe(id);
    });

    test("getUserByEmail(): should get the user by email", async () => {
      let user = await userGateway.getUserByEmail(email);
      expect(user?.email).toBe(email);
    });
  });

  afterAll(async () => {
    await stopDB();
  });
});
