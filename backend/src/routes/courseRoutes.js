import express from "express";

import { createCourse , getAllCourse } from "../controllers/courseController";

const router = express.Router()
router.route("/").post(createCourse).get(getAllCourse);