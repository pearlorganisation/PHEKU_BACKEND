import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    duration: { type: Number, required: true }, // In months, frontend will show it in year
    courseLevel: {
      type: String,
      enum: ["Undergraduate", "Postgraduate", "Diploma", "PhD"],
    },
    tutionFees: { amount: Number, currency: String },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
