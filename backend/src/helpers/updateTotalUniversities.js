import mongoose from "mongoose";
import Country from "../models/country/country.js";
import University from "../models/university.js";
import ApiError from "../utils/ApiError.js";
import Course from "../models/course/course.js";

export const updateTotalUniversitiesForCountry = async (countryId) => {
  try {
    if (!countryId) {
      console.log("No valid country ID provided for university update.");
      return;
    }

    const aggregationResult = await University.aggregate([
      { $match: { country: countryId } },
      { $group: { _id: "$country", totalUniversities: { $sum: 1 } } },
    ]);

    const totalUniversities = aggregationResult.length
      ? aggregationResult[0].totalUniversities
      : 0;

    const updatedCountry = await Country.findByIdAndUpdate(
      countryId,
      { totalUniversities },
      { new: true, runValidators: true }
    );

    if (!updatedCountry) {
      console.log(`No matching country found for ID ${countryId}`);
    }

    console.log(
      `Updated totalUniversities for country ${countryId}: ${totalUniversities}`
    );
  } catch (error) {
    console.error("Failed to process university aggregation:", error.message);
  }
};

export const updateTotalCoursesForUniversity = async (universityId) => {
  try {
    const aggregationResult = await Course.aggregate([
      { $match: { university: universityId } },
      { $group: { _id: "$university", totalCourse: { $sum: 1 } } },
    ]);

    const totalCourse = aggregationResult.length
      ? aggregationResult[0].totalCourse
      : 0;

    await University.findByIdAndUpdate(
      universityId,
      { totalCourse },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error("Error during aggregation update:", error.message);
  }
};
