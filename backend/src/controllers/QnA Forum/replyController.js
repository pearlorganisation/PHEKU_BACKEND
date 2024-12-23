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

export const getAllReplyForDiscussion = asyncHandler(async (req, res, next) => {
  const { discussionId } = req.params;

  // Validate discussion existence
  const discussionExists = await Discussion.findById(discussionId);
  if (!discussionExists) {
    return next(new ApiError("Discussion not found", 404));
  }

  // Fetch all replies for the discussion
  const replies = await Reply.find({ discussion: discussionId })
    .populate("user", "fullName email")
    .lean(); // Use `lean` for better performance when manipulating data

  if (!replies || replies.length === 0) {
    return next(new ApiError("No replies found for this discussion", 404));
  }

  // Build the parent-children hierarchy
  const replyMap = {};
  replies.forEach((reply) => {
    reply.children = []; // Initialize the children array for each reply
    replyMap[reply._id] = reply; // Map each reply by its ID
  });

  const result = [];
  replies.forEach((reply) => {
    if (reply.parent) {
      // If the reply has a parent, add it to the parent's children array
      replyMap[reply.parent]?.children.push(reply);
    } else {
      // If the reply has no parent, it's a top-level reply
      result.push(reply);
    }
  });

  // Return the hierarchical response
  return res
    .status(200)
    .json(new ApiResponse("Replies fetched successfully", result));
});
