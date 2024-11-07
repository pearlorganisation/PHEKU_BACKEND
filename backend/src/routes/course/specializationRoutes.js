// src/routes/specializationRoutes.js

import express from "express";
import {
  createSpecialization,
  deleteSpecializationById,
  getSpecializationById,
  getSpecializations,
  updateSpecializationById,
} from "../../controllers/course/specializationController.js";

const router = express.Router();

router
  .route("/")
  .post(createSpecialization) // Create a specialization
  .get(getSpecializations); // Get all specializations

router
  .route("/:id")
  .get(getSpecializationById) // Get a specialization by ID
  .put(updateSpecializationById) // Update a specialization by ID
  .delete(deleteSpecializationById); // Delete a specialization by ID

export default router;
