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
  .post(upload.array("images", 5), createAccomodation)
  .get(getAllAccomodation);
router
  .route("/:id")
  .get(getAccomodationById)
  .delete(deleteAccomodationById)
  .patch(updateAccomodationById);

export default router;
