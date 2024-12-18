import mongoose from "mongoose";

const accommodationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // type: {
    //   type: String,
    //   enum: ["dormitory", "pg"], // Type can be either dormitory or PG
    //   required: true,
    // },
    description: {
      type: String,
      required: true,
    },
    images: [
      //Empty array if not send data
      {
        asset_id: { type: String, required: true },
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    location: {
      // location must be an object containing below field-> required
      country: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      locationCoordinates: {
        type: {
          type: String,
          enum: ["Point"], // 'location.type' must be 'Point'
          required: true,
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
    },
    capacity: {
      type: Number,
      required: true, // Maximum number of students that can stay
    },
    availableSpaces: {
      type: Number,
      required: true, // Current number of available spaces
    },
    amenities: [{ name: { type: String }, icon: { type: String } }],
    fees: {
      monthly: {
        type: Number,
        required: true, // Monthly fee for staying
      },
      securityDeposit: {
        type: Number,
        required: true, // Security deposit amount
      },
    },
    contactInfo: {
      phone: {
        type: String,
        required: true, // Contact number for inquiries
      },
      email: {
        type: String,
        required: true, // Email for inquiries
      },
    },
    ownerName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create a 2dsphere index on the location field
accommodationSchema.index({ "location.locationCoordinates": "2dsphere" });

const Accommodation = mongoose.model("Accommodation", accommodationSchema);

export default Accommodation;
