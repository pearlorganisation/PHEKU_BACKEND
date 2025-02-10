import express from "express";
import {
  createUserByAdmin,
  login,
  logout,
  resendInvite,
  setPassword,
  signup,
  verifyInvite,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(authenticateToken, logout);
router.route("/invite").post(createUserByAdmin); // Not done yet- Work in progress
router.route("/verify-invite").get(verifyInvite);
router.route("/set-password").post(setPassword);
router.route("/resend-invite/:id").post(resendInvite);

export default router;
