import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getUserDetails } from "../controllers/userController.js";

const router = express.Router();

router.route("/me").get(authenticateToken, getUserDetails);

export default router;
