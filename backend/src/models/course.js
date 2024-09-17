import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    slug: {
      type: String,
      required: true,
    },
    duration: {
      minDuration: Number,
      maxDuration: Number,
    },
    courseLevel: [
      {
        label: String,
        slug: String,
      },
    ],
    examType: [
      {
        label: String,
        slug: String,
      },
    ],
    fees: {
      minAmount: String,
      maxAmount: String,
    },
    location: [
      {
        name: String,
        slug: String,
      },
    ],
    specialization: [
      {
        label: String,
        slug: String,
      },
    ],
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
