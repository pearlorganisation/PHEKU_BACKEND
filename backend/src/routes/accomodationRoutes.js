import express from "express";
import {
  createAccomodation,
  deleteAccomodationById,
  getAccomodationById,
  getAllAccomodation,
  updateAccomodationById,
} from "../controllers/accomodationController.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "amenities", maxCount: 10 },
    ]),
    createAccomodation
  )
  .get(getAllAccomodation);
router
  .route("/:id")
  .get(getAccomodationById)
  .delete(deleteAccomodationById)
  .patch(
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "amenities", maxCount: 10 },
    ]),
    updateAccomodationById
  );

export default router;
