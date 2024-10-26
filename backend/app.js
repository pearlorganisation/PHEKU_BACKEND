import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

const app = express();

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  credentials: true,
};

// Use CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.set("view engine", "ejs");

//Routes Imports
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import universityRouter from "./src/routes/universityRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import courseRouter from "./src/routes/courseRoutes.js";
import jobRouter from "./src/routes/jobRoutes.js";
import accomodationRouter from "./src/routes/accomodationRoutes.js";
import examRouter from "./src/routes/examRoutes.js";
import contactRouter from "./src/routes/contactRoutes.js";
import countryRouter from "./src/routes/country/countryRoutes.js";

//Routes Declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/universities", universityRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/accomodations", accomodationRouter);
app.use("/api/v1/exams", examRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/countries", countryRouter);

app.use(errorHandler);

export { app };
