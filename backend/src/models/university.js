import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
});

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String },
    coverPhotoSrc: { type: String },
    logoSrc: { type: String },
    country: { type: String, required: true },
    // countrySlug: { type: String, required: true },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: { type: String, required: true },
    highlights: {
      //Main points
      type: String,
    },
    estd: { type: String },
    overview: {
      //about university
      type: String,
    },
    email: { type: String },
    phone: { type: String },
    ranking: {
      global: Number,
      national: Number,
    },
    totalCourse: { type: Number },
    totalRating: { type: Number },
    location: { type: String, required: true }, // Embeded link of googel map location
    website: { type: String, required: true },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    faculties: [facultySchema], // Array of faculty members
  },
  { timestamps: true }
);

const University = mongoose.model("University", universitySchema);

export default University;
