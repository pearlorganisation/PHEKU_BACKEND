import mongoose from "mongoose";

const examSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Title of the exam (e.g., "Final Exam", "Midterm Exam")
    },
    course: {
      type: String,
      required: true,
    },
    description: {
      type: String, // Brief description of the exam
    },
    date: {
      type: Date, // Date when the exam is scheduled
      required: true,
    },
    duration: {
      type: String, // Exam duration (e.g., "2 hours", "3 hours")
      required: true,
    },
    location: {
      type: String, // Physical or online location for the exam
      required: true,
    },
    invigilator: {
      type: String, // Name of the person responsible for overseeing the exam
    },
    instructions: {
      type: String, // Additional instructions or guidelines for the exam
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
