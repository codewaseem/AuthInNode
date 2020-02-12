import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import morgan from "morgan";

import authRouter from "../auth/routes";

const app = express();

app.disable("x-powered-by");

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/auth", authRouter);

export default app;
