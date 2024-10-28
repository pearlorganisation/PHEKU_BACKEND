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
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    highlights: { type: String },
    estd: { type: String },
    overview: { type: String },
    email: { type: String },
    phone: { type: String },
    ranking: { global: Number, national: Number },
    totalCourse: { type: Number },
    totalRating: { type: Number },
    location: { type: String, required: true }, // Embeded link of googel map location
    website: { type: String, required: true },
    faculties: [facultySchema], // Array of faculty members
  },
  { timestamps: true }
);

const University = mongoose.model("University", universitySchema);

export default University;
