import express from "express";
import {
  authenticateToken,
  verifyPermission,
} from "../middlewares/authMiddleware.js";
import {
  changePassword,
  deleteUserById,
  forgotPassword,
  getUserById,
  getUserDetails,
  resetPassword,
  updateUserDetails,
} from "../controllers/userController.js";
import { USER_ROLES_ENUM } from "../../constants.js";

const router = express.Router();

router
  .route("/me")
  .get(authenticateToken, getUserDetails)
  .patch(updateUserDetails);

// Only(super_admin, admin)
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
    deleteUserById // Only(super_admin and admin)
  );
//   .patch(updateUserById);

router.route("/change-password").patch(authenticateToken, changePassword);
router.route("/forgot").post(forgotPassword);
router.route("/reset/:resetToken").post(resetPassword);

export default router;
