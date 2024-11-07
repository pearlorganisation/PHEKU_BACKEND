import mongoose from "mongoose";

// Course Level Schema
const courseLevelSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    unique: true, // Ensures no two levels have the same name
    trim: true, // Removes leading/trailing whitespace
    minlength: [3, "Course level name must be at least 3 characters long"], // Minimum length validation
    maxlength: [50, "Course level name cannot exceed 50 characters"], // Maximum length validation
  },
});

// Creating the model based on the schema
const CourseLevel = mongoose.model("CourseLevel", courseLevelSchema);

export default CourseLevel;
