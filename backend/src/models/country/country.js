import mongoose from "mongoose";

// Define the Country schema
const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     coverPhotoSrc: {
//       type: String,
//       required: true,
//     },
//     totalCourses: { // 
//       type: Number,
//       default: 0,
//     },
//     totalUniversities: {
//       type: Number,
//       default: 0,
//     },
  },
  {
    timestamps: true, 
  }
);

// Create the Country model
const Country = mongoose.model("Country", countrySchema);

export default Country;
