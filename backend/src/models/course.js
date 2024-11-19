import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
    // country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    duration: { type: Number, required: true }, // In months, || frontend will show it in year
    courseLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
    },
    tutionFees: { amount: Number, currency: String },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseLevel",
    },
  },
  { timestamps: true }
);

courseSchema.index({ name: 1, university: 1 }, { unique: true });
const Course = mongoose.model("Course", courseSchema);

export default Course;
