require("dotenv").config();

import DBConnector from "./database/DBConnector";
import app from "./server/app";

const port: number = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "localhost";

(async function main() {
  let dbConnector = new DBConnector();
  // eslint-disable-next-line no-unused-vars
  let dbConnection = await dbConnector.start(
    process.env.DATABASE_URL || "mongodb://localhost:27017/dev"
  );
  console.log(`Database connected`);

  app.listen(port, hostname, () => {
    console.log(`Server started at ${hostname}:${port}`);
  });
})();
