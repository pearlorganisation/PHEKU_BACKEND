import mongoose from "mongoose";
import DiscussionTag from "../../models/QnA Forum/discussionTag.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildDiscussionTagsPipeline } from "../../helpers/aggregationPipelines.js";

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

export const getAllDiscussionTags = asyncHandler(async (req, res, next) => {
  const { categoryId, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const pagination = req.query.pagination;

  const pipeline = buildDiscussionTagsPipeline(
    search,
    categoryId,
    page,
    limit,
    pagination
  );
  const discussionTags = await DiscussionTag.aggregate(pipeline);
  // console.log(JSON.stringify(discussionTags, null, 2));
  if (!discussionTags || discussionTags.length === 0) {
    return next(new ApiError("No Discussion Tags found", 404));
  }

  // discussionTags: [{ metadata: [ {total: 10} ], data: [ {}, {} ] }] with pagination data look like this
  if (pagination) {
    const totalDocuments = discussionTags[0].metadata[0]?.total || 0;
    const data = discussionTags[0].data || [];
    const totalPages = Math.ceil(totalDocuments / limit);

    const paginationInfo = {
      total: totalDocuments,
      current_page: page,
      limit,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
      pages: Array.from({ length: totalPages }, (_, i) => i + 1),
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          "Fetched all Discussion Tags successfully",
          data,
          paginationInfo
        )
      );
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          "Fetched all Discussion Tags successfully",
          discussionTags
        )
      );
  }
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
