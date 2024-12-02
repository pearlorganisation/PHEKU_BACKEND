import express from "express";

import {
  createCourse,
  deleteCourseById,
  getAllCourse,
  getCourseById,
  updateCourseById,
} from "../controllers/courseController.js";

const router = express.Router();

router.route("/").post(createCourse).get(getAllCourse);
router
  .route("/:id")
  .get(getCourseById)
  .patch(updateCourseById)
  .delete(deleteCourseById);

export default router;
