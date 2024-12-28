import mongoose from "mongoose";

const examSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Title of the exam (e.g., "IELTS", "GRE")
    },
    course: {
      type: String,
      required: true, // Course or subject related to the exam
    },
    description: {
      type: String, // Brief description of the exam
    },
    duration: {
      type: String, // Exam duration (e.g., "2 hours", "3 hours")
    },
    examType: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },
    location: {
      type: String, // Location where the exam is conducted
    },
    invigilator: {
      type: String, // Name of the invigilator
    },
    conductingAuthority: {
      type: String, // Authority conducting the exam (e.g., "ETS", "British Council")
    },
    instructions: {
      type: String, // Special instructions for the exam
    },
    availableInCountries: {
      type: [mongoose.Schema.Types.ObjectId], // List of country IDs where the exam is available
      ref: 'Country',
    },
    eligibility: {
      type: String, // Eligibility criteria for the exam
    },
    examSections: {
      type: [String], // Sections of the exam (e.g., "Reading", "Writing", "Listening", "Speaking")
    },
    scoreRange: {
      type: String, // Score range for the exam (e.g., "0-9", "200-800")
    },
    registrationDeadline: {
      type: Date, // Deadline for registration
    },
    fee: {
      type: Number, // Exam fee
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
 