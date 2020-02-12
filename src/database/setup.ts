import mongoose from "mongoose";

export async function getDBConnection(dbUrl: string) {
  return await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
}
