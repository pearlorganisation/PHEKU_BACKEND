import express from "express";
import {
  createUniversity,
  deleteUniversityById,
  getAllUniversities,
  getUniversityById,
  updateUniversityById,
} from "../controllers/universityController.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    upload.fields([
      { name: "coverPhoto", maxCount: 1 },
      { name: "logo", maxCount: 1 },
    ]),
    createUniversity
  ) // Multer middleware to handle file uploads
  .get(getAllUniversities);

router
  .route("/:id")
  .get(getUniversityById)
  .delete(deleteUniversityById)
  .patch(
    upload.fields([
      { name: "coverPhoto", maxCount: 1 },
      { name: "logo", maxCount: 1 },
    ]),
    updateUniversityById
  );

export default router;
