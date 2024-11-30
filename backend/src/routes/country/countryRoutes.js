import express from "express";
import {
  createCountry,
  deleteCountryById,
  getCountries,
  getCountryById,
  updateCountryById,
} from "../../controllers/country/countryController.js";

const router = express.Router();

// Define the routes
router
  .route("/")
  .post(createCountry) // Create a country
  .get(getCountries); // Get all countries | pagination

router
  .route("/:id")
  .get(getCountryById) // Get a country by ID
  .delete(deleteCountryById) // Delete a country by ID
  .put(updateCountryById); // Update a country by ID

export default router;
