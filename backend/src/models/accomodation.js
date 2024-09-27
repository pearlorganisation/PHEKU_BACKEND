import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['dormitory', 'pg'], // Type can be either dormitory or PG
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true, // Maximum number of students that can stay
    },
    availableSpaces: {
      type: Number,
      required: true, // Current number of available spaces
    },
    amenities: [
      {
        type: String, // e.g., WiFi, laundry, meals, etc.
      },
    ],
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
    description: {
      type: String,
      required: true, // Brief description of the accommodation
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
    owner: {
      name: {
        type: String,
        required: true, // Name of the owner
      },
      phone: {
        type: String,
        required: true, // Owner's contact number
      },
      email: {
        type: String,
        required: true, // Owner's email address
      },
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

const Accommodation = mongoose.model('Accommodation', accommodationSchema);

export default Accommodation;
