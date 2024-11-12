// routes/roleRouter.js

import express from "express";
import {
  createRole,
  deleteRoleById,
  getRoleById,
  getRoles,
  updateRoleById,
} from "../../controllers/role/roleController";

const router = express.Router();

// Routes for Role CRUD operations
router
  .route("/")
  .post(createRole) // Create a new role
  .get(getRoles); // Get all roles

router
  .route("/:id")
  .get(getRoleById) // Get a role by ID
  .put(updateRoleById) // Update a role by ID
  .delete(deleteRoleById); // Delete a role by ID

export default router;
