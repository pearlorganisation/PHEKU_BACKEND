import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country" }, // Dropdown with Server-Side Pagination, Admin panel
    university: { type: mongoose.Schema.Types.ObjectId, ref: "University" }, // Fetch university by counId(uniRoutes)
    duration: { type: Number, required: true }, // In months, || frontend will show it in year
    courseLevel: {
      // Get all course level api(course level routes)
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseLevel",
    },
    tutionFees: { amount: Number, currency: String },
    specialization: {
      // Get all spec (no pagination yet)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
    },
    description: { type: String, required: true }, // Edittor
  },
  { timestamps: true }
);

courseSchema.index({ name: 1, university: 1 }, { unique: true });
const Course = mongoose.model("Course", courseSchema);

export default Course;
