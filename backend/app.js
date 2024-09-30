import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from 'cors'



const app = express();
// cors config
app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "PATCH"], 
    credentials: true, 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.set('view engine', 'ejs');

//Routes Imports
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import universityRouter from "./src/routes/universityRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import courseRouter from "./src/routes/courseRoutes.js";
import jobRouter from "./src/routes/jobRoutes.js";
import accomodationRouter from "./src/routes/accomodationRoutes.js"
import examRouter from "./src/routes/examRoutes.js"

//Routes Declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/universities", universityRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/accomodation", accomodationRouter);
app.use("/api/v1/exams",examRouter);

app.use(errorHandler);

export { app };
