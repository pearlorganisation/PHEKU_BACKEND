import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./src/routes/authRoutes.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

//Routes Declaration
app.use("/api/v1/auth", authRouter);

export { app };
