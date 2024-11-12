import Role from "../../models/role/role.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new role
export const createRole = asyncHandler(async (req, res, next) => {
  const { roleName, description } = req.body;

  // Check if the role already exists
  const existingRole = await Role.findOne({ roleName });
  if (existingRole) {
    return next(new ApiError("Role already exists", 400));
  }

  // Create a new role
  const role = await Role.create({ roleName, description });
  if (!role) {
    return next(new ApiError("Failed to create the role", 400));
  }

  return res
    .status(201)
    .json(new ApiResponse("Role created successfully", role));
});

// Get all roles
export const getRoles = asyncHandler(async (req, res, next) => {
  const roles = await Role.find();
  if (!roles || roles.length === 0) {
    return next(new ApiError("No roles found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Roles fetched successfully", roles));
});

// Get a role by ID
export const getRoleById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const role = await Role.findById(id);
  if (!role) {
    return next(new ApiError("Role not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Role fetched successfully", role));
});

// Update a role by ID
export const updateRoleById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { roleName, description } = req.body;

  // Find and update the role
  const role = await Role.findByIdAndUpdate(
    id,
    { roleName, description },
    { new: true }
  );
  if (!role) {
    return next(new ApiError("Failed to update the role", 400));
  }

  return res
    .status(200)
    .json(new ApiResponse("Role updated successfully", role));
});

// Delete a role by ID
export const deleteRoleById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const role = await Role.findByIdAndDelete(id);
  if (!role) {
    return next(new ApiError("Role not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Role deleted successfully", role));
});
