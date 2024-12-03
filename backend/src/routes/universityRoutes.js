import express from "express";
import {
  createUniversity,
  deleteUniversityById,
  getAllUniversities,
  getUniversityById,
  syncFaculties,
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
  .get(getAllUniversities); // Admin panel get uni by countryId(course creation)

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

router.route("/:universityId/faculties/sync").patch(syncFaculties);
// router.route("/search").get(getUniversities); // For admin dropdown, for search university main website

export default router;
