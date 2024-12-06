import mongoose from "mongoose";
// import { updateTotalCoursesForCountry } from "../helpers/updateTotalCourses";

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  contactEmail: { type: String, required: true },
});

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    overview: { type: String }, // Edditor, frontend will send raw html
    highlights: { type: String }, // Edditor
    facilities: { type: String }, // Edditor
    coverPhoto: { secure_url: { type: String }, public_id: { type: String } },
    logo: { secure_url: { type: String }, public_id: { type: String } },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" }, // Filtering
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    estdYear: { type: String },
    email: { type: String },
    location: { type: String, required: true }, // Embeded link of googel map location
    website: { type: String, required: true },
    phone: { type: String },
    ranking: { global: Number, national: Number },
    totalCourse: { type: Number, default: 0 }, // No need to parse these from string to num
    totalRating: { type: Number, default: 0 },
    faculties: [facultySchema], // Array of faculty members
  },
  { timestamps: true }
);



const University = mongoose.model("University", universitySchema);

export default University;
