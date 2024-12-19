import Discussion from "../../models/QnA Forum/discussion.js";
import Reply from "../../models/QnA Forum/reply.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const addReply = asyncHandler(async (req, res, next) => {
  const { discussionId } = req.params;
  const { text, parent } = req.body;

  // Validate discussion existence
  const discussionExists = await Discussion.findById(discussionId);
  if (!discussionExists) {
    return next(new ApiError("Discussion not found", 404));
  }

  // Validate parent reply existence if provided
  if (parent) {
    const parentReply = await Reply.findById(parent);
    if (!parentReply) {
      return next(new ApiError("Parent reply not found", 404));
    }
  }

  // Create the reply
  const reply = await Reply.create({
    text,
    user: req.user._id,
    parent: parent || null,
    discussion: discussionId,
  });

  // If creation fails
  if (!reply) {
    return next(new ApiError("Failed to create the reply", 400));
  }

  // Return success response
  return res
    .status(201)
    .json(new ApiResponse("Reply added successfully", reply));
});
