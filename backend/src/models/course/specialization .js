import mongoose from "mongoose";

const specializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Removes leading/trailing whitespace
    minlength: [3, "Specialization name must be at least 3 characters long"],
    maxlength: [100, "Specialization name cannot exceed 100 characters"],
  },
}); // No need for timestamps

const Specialization = mongoose.model("Specialization", specializationSchema);

export default Specialization;
