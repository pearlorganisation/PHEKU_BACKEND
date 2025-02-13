import express from "express";
import {
  authenticateToken,
  verifyPermission,
} from "../middlewares/authMiddleware.js";
import {
  changePassword,
  changeRole,
  createUserByAdmin,
  deleteUserById,
  forgotPassword,
  getUserById,
  getUserDetails,
  resendInvite,
  resetPassword,
  setPassword,
  updateUserDetails,
  verifyInvite,
} from "../controllers/userController.js";
import { USER_ROLES_ENUM } from "../../constants.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();

// Static routes
router.route("/invite").post(createUserByAdmin);
router.route("/verify-invite").get(verifyInvite);
router.route("/set-password").post(setPassword);
router.route("/change-password").patch(authenticateToken, changePassword);
router.route("/forgot").post(forgotPassword);

// Parameterized routes
router.route("/resend-invite/:userId").post(resendInvite); // auth required
router.route("/change-role/:userId").patch(changeRole); // For now super admin can change role, auth required
router.route("/reset/:resetToken").post(resetPassword);

// Authenticated routes or Contextual Routes
router
  .route("/me")
  .get(authenticateToken, getUserDetails)
  .patch(upload.single("profilePic"), authenticateToken, updateUserDetails);

// Dynamic route (catch-all dynamic paths should be at the end)
router
  .route("/:id")
  .get(
    authenticateToken,
    verifyPermission([
      USER_ROLES_ENUM.SUPER_ADMIN,
      USER_ROLES_ENUM.ADMIN,
      USER_ROLES_ENUM.TEACHER,
      USER_ROLES_ENUM.COUNSELOR,
      USER_ROLES_ENUM.PARENT,
      USER_ROLES_ENUM.AGENT,
      USER_ROLES_ENUM.INSTITUTION_MANAGER,
    ]),
    getUserById
  )
  .delete(
    authenticateToken,
    verifyPermission([USER_ROLES_ENUM.SUPER_ADMIN, USER_ROLES_ENUM.ADMIN]),
    deleteUserById // Only accessible by super_admin and admin
  );

export default router;
