import express from "express";
import {
  createUniversity,
  getAllUniversities,
} from "../controllers/universityController.js";

const router = express.Router();

router.route("/").post(createUniversity).get(getAllUniversities);

export default router;
