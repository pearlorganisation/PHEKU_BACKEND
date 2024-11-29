import DiscussionTag from "../../models/QnA Forum/discussionTag.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new Discussion Tag
export const createDiscussionTag = asyncHandler(async (req, res, next) => {
  const { name, category } = req.body;

  // Create tag with name and category
  const discussionTag = await DiscussionTag.create({ name, category });

  if (!discussionTag) {
    return next(new ApiError("Failed to create the Discussion Tag", 400));
  }

  return res
    .status(201)
    .json(
      new ApiResponse("Created the Discussion Tag successfully", discussionTag)
    );
});

// Get all Discussion Tags
export const getAllDiscussionTags = asyncHandler(async (req, res, next) => {
  const discussionTags = await DiscussionTag.find().populate("category");

  if (!discussionTags || discussionTags.length === 0) {
    return next(new ApiError("No Discussion Tags found", 404));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        "Fetched all Discussion Tags successfully",
        discussionTags
      )
    );
});

// Get a single Discussion Tag by ID
export const getDiscussionTagById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const discussionTag = await DiscussionTag.findById(id).populate("category");

  if (!discussionTag) {
    return next(new ApiError("Discussion Tag not found", 404));
  }

  return res
    .status(200)
    .json(
      new ApiResponse("Fetched the Discussion Tag successfully", discussionTag)
    );
});

// Update a Discussion Tag
export const updateDiscussionTagById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;

  const discussionTag = await DiscussionTag.findByIdAndUpdate(
    id,
    { name, category },
    { new: true, runValidators: true }
  );

  if (!discussionTag) {
    return next(new ApiError("Discussion Tag not found", 404));
  }

  return res
    .status(200)
    .json(
      new ApiResponse("Updated the Discussion Tag successfully", discussionTag)
    );
});

// Delete a Discussion Tag
export const deleteDiscussionTagById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const discussionTag = await DiscussionTag.findByIdAndDelete(id);

  if (!discussionTag) {
    return next(new ApiError("Discussion Tag not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Deleted the Discussion Tag successfully"));
});