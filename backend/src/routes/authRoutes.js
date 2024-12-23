import express from "express";
import {
  login,
  logout,
  signup,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();

router.route("/signup").post(upload.single("profile"), signup);
router.route("/login").post(login);
router.route("/logout").post(authenticateToken, logout);


export default router;
