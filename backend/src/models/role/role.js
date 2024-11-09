import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  roleName: { type: String, unique: true, required: true },
  description: { type: String },
  //   permissions: [String], // Array of permission strings like 'CAN_MANAGE_USERS', 'CAN_VIEW_REPORTS'
});

const Role = mongoose.model("Role", roleSchema);

export default Role;
