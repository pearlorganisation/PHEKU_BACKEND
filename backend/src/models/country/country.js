import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    thumbImage: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    coverPhoto: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    about: { type: String, default: "" }, // Edditor: Visa req, cultural tips, living expenses
    totalUniversities: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Country = mongoose.model("Country", countrySchema);

export default Country;
