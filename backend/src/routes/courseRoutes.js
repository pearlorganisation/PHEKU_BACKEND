import express from "express";

import {
  createCourse,
  deleteById,
  getAllCourse,
  getCourseById,
  updateById,
} from "../controllers/courseController.js";

const router = express.Router();
router.route("/").post(createCourse).get(getAllCourse);
router.route("/:id").get(getCourseById).patch(updateById).delete(deleteById);

export default router;
