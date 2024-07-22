import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"));

//Test Routes
app.get("/", (req, res) => {
  res.send("Server up and running");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
