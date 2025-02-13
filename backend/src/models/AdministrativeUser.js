import mongoose from "mongoose";
import User from "./user.js";

// Descriminator for Administrative User
const administrativeUserSchema = new mongoose.Schema({
  isInvited: {
    // For the admin panel users
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "PENDING",
    enum: ["PENDING", "ACTIVE", "INACTIVE"], // Registration status for the admin panel users
  },
});

const AdministrativeUser = User.discriminator(
  "AdministrativeUser",
  administrativeUserSchema
);

export default AdministrativeUser;

// Can add more descriminators for different types of users(TEACHER, ACCOMMODATION_MANAGER, etc) if they also have different fields
