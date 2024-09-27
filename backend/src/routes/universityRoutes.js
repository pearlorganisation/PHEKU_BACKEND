import express from "express";
import {
  createUniversity,
  deleteUniversityById,
  getAllUniversities,
  getUniversityById,
  updateUniversityById,
} from "../controllers/universityController.js";

const router = express.Router();

router.route("/").post(createUniversity).get(getAllUniversities);
router.route("/:id").get(getUniversityById).delete(deleteUniversityById).patch(updateUniversityById)
export default router;
