import Discussion from "../../models/QnA Forum/discussion.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createDiscussion = asyncHandler(async (req, res, next) => {
  const { title, content, user, category, tags } = req.body;

  // Validate required fields
  if (!title || !content || !user || !category) {
    return next(
      new ApiError(
        "Title, content, user, and category are required fields",
        400
      )
    );
  }

  // Create a new discussion
  const discussion = await Discussion.create({
    title,
    content,
    user,
    category,
    tags,
  });

  // If creation fails
  if (!discussion) {
    return next(new ApiError("Failed to create the discussion", 400));
  }

  // Return success response
  return res
    .status(201)
    .json(new ApiResponse("Discussion created successfully", discussion));
});

export const voteDiscussion = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { vote } = req.body; // expect vote to be either 1 (upvote), -1 (downvote), or 0 (remove vote)
  const userId = req.user.id; // Assuming user ID is available from the token

  // Validate vote
  if (![1, -1, 0].includes(vote)) {
    return next(
      new ApiError(
        "Vote must be 1 (upvote), -1 (downvote), or 0 (remove vote).",
        400
      )
    );
  }

  // Find the discussion
  const discussion = await Discussion.findById(id);
  if (!discussion) {
    return next(new ApiError("Discussion not found.", 404));
  }

  // Check if the user has already voted
  const existingVote = discussion.votes.find(
    (v) => v.userId.toString() === userId
  );

  if (existingVote) {
    if (vote === 0) {
      // Remove the vote if vote is 0
      discussion.votes = discussion.votes.filter(
        (v) => v.userId.toString() !== userId
      );
    } else {
      // Update the existing vote
      existingVote.vote = vote;
    }
  } else {
    // Add new vote
    discussion.votes.push({ userId, vote });
  }

  // Save the discussion with the updated votes
  await discussion.save();

  // Calculate only upvotes
  const upvotes = discussion.votes.filter((v) => v.vote === 1).length;

  // Return success response
  return res.status(200).json({
    message: "Vote updated successfully.",
    userVote: vote,
    upvotes,
  });
});

// getting status for particular discussion->  API not tested yet
export const getVoteStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Discussion ID
  const userId = req.user.id; // User ID from token

  const userVote = await Vote.findOne({ userId, discussionId: id }).then(
    (vote) => vote?.vote || 0
  );
  const upvotesCount = await Vote.countDocuments({ discussionId: id, vote: 1 });

  return res.status(200).json({ userVote, upvotesCount });
});
