import express from "express";
import {
  createCourseLevel,
  deleteCourseLevelById,
  getCourseLevelById,
  getCourseLevels,
  updateCourseLevelById,
} from "../../controllers/course/courseLevelController.js";

const router = express.Router();

// Routes for Course Level CRUD operations
router
  .route("/")
  .post(createCourseLevel) // Create a new course level
  .get(getCourseLevels); // Get all course levels

router
  .route("/:id")
  .get(getCourseLevelById) // Get a course level by ID
  .put(updateCourseLevelById) // Update a course level by ID
  .delete(deleteCourseLevelById); // Delete a course level by ID

export default router;
