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
  contactEmail: String,
});

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    highlights: {
      //Main points
      type: String,
    },
    overview: {
      //about university
      type: String,
    },
    contactInfo: {
      // phone: String,
      email: String,
      website: String,
    },
    ranking: {
      global: Number,
      national: Number,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    faculty: [facultySchema], // Array of faculty members
  },
  { timestamps: true }
);

const University = mongoose.model("University", universitySchema);

export default University;
