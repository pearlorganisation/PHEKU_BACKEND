import express from "express";
import {
  createCountry,
  deleteCountryById,
  getCountries,
  getCountryById,
  updateCountryById,
} from "../../controllers/country/countryController.js";
import { upload } from "../../middlewares/multerMiddleware.js";

const router = express.Router();

// Define the routes
router
  .route("/")
  .post(
    upload.fields([
      { name: "thumbImage", maxCount: 1 },
      { name: "coverPhoto", maxCount: 1 },
    ]),
    createCountry
  ) // Create a country
  .get(getCountries); // Get all countries | pagination | used during course creation, university creation | fields

router
  .route("/:id")
  .get(getCountryById) // Get a country by ID
  .delete(deleteCountryById) // Delete a country by ID
  .patch(
    upload.fields([
      { name: "thumbImage", maxCount: 1 },
      { name: "coverPhoto", maxCount: 1 },
    ]),
    updateCountryById
  ); // Update a country by ID

export default router;
