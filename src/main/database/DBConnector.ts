import mongoose from "mongoose";

export default class DBConnector {
  private dbConnection: mongoose.Mongoose | undefined;

  async start(dbUri: string) {
    return (this.dbConnection = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }));
  }

  async stop() {
    await this.dbConnection?.disconnect();
  }
}
