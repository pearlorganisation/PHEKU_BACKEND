import express from "express";
import { createExam, examById, examDeleteById, examUpdateById, getExam } from "../controllers/examController.js";

const router = express.Router();

router.route("/").get(getExam).post(createExam);
router.route("/:id").get(examById).patch(examUpdateById).delete(examDeleteById)
export default router