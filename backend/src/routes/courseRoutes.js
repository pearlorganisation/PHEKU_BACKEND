import express from "express";

import { createCourse , deleteById, getAllCourse, getCourseById } from "../controllers/courseController.js";

const router = express.Router()
router.route("/").post(createCourse).get(getAllCourse);
router.route("/:id").get(getCourseById).delete(deleteById);
export default router