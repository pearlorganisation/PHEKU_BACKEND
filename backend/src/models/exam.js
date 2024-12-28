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
      
    },
    duration: {
       // Exam duration (e.g., "2 hours", "3 hours")
      type: String
    },
    examType: {
      type: String,
      enum: ["Online", "Offline"],
      required: true
    },
    location: {
      type: String,  
      
    },
    invigilator: {
      type: String,  
    },
    conductingAuthority:{
      type: String,
    },
    instructions: {
      type: String,  
    },
    availableInCountries: {
      type: [mongoose.Schema.Types.ObjectId], // List of country IDs where the exam is available
      ref: 'Country'
    },
    eligibility:{
      type: String,
    }
    },
    {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
