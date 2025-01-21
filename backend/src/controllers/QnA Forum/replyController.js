import Discussion from "../../models/QnA Forum/discussion.js";
import Reply from "../../models/QnA Forum/reply.js";
import ReplyVote from "../../models/QnA Forum/replyVote.js";
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
      // If the reply has a parent, add reply to the parent's children array of reply map
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

export const updateReplyById = asyncHandler(async (req, res, next) => {
  const { replyId } = req.params;
  const { text } = req.body;

  // Find the reply by ID
  const reply = await Reply.findById(replyId);

  // If reply is not found
  if (!reply) {
    return next(new ApiError("Reply not found", 404));
  }

  // Check if the logged-in user is the owner of the reply
  if (reply.user.toString() !== req.user.id) {
    return next(new ApiError("You are not authorized to edit this reply", 403));
  }

  // Update the reply
  reply.text = text;
  const updatedReply = await reply.save();

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse("Reply updated successfully", updatedReply));
});

export const deleteReplyById = asyncHandler(async (req, res, next) => {
  const { replyId } = req.params;

  // Attempt to delete the reply with a filter
  const result = await Reply.deleteOne({ _id: replyId, user: req.user.id }); // { acknowledged: true, deletedCount: 1 }
  console.log(result);

  if (!result.deletedCount) {
    //deletedCount will be 0 if no doc deleted
    return next(
      new ApiError(
        "Reply not found or you are not authorized to delete it",
        404
      )
    );
  }

  // Return success response
  return res.status(200).json(new ApiResponse("Reply deleted successfully"));
});

export const voteOnReply = asyncHandler(async (req, res, next) => {
  const { replyId } = req.params;
  const { vote } = req.body;
  const user = req.user._id;
  // Validate vote
  if (![1, -1, 0].includes(vote)) {
    return next(
      new ApiError(
        "Vote must be 1 (upvote), -1 (downvote), or 0 (remove vote).",
        400
      )
    );
  }

  // Find the reply
  const reply = await Reply.findById(replyId);

  // If reply is not found
  if (!reply) {
    return next(new ApiError("Reply not found", 404));
  }

  // // Check if the logged-in user is the owner of the reply
  // if (reply.user.toString() === user.toString()) {
  //   return next(new ApiError("You cannot vote on your own reply", 403));
  // }

  // Check if the user has already voted on this reply
  const existingVote = await ReplyVote.findOne({
    user,
    reply: replyId,
  });

  if (existingVote) {
    if (vote === 0) {
      await existingVote.deleteOne();
    } else {
      // Update the existing vote
      existingVote.vote = vote;
      await existingVote.save();
    }
  } else {
    // Create a new vote
    await ReplyVote.create({
      user,
      reply: replyId,
      vote,
    });
  }
  // Calculate only upvotes
  const upvotes = await ReplyVote.countDocuments({ reply: replyId, vote: 1 });
  // Return success response
  return res
    .status(200)
    .json(
      new ApiResponse("Vote recorded successfully", { userVote: vote, upvotes })
    );
});
