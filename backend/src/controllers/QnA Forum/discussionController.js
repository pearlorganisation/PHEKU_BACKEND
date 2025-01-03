import Discussion from "../../models/QnA Forum/discussion.js";
import Vote from "../../models/QnA Forum/vote.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createDiscussion = asyncHandler(async (req, res, next) => {
  const { title, content, category, tags } = req.body; // take user from token

  // Create a new discussion
  const discussion = await Discussion.create({
    title,
    content,
    user: req.user._id,
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

// export const voteDiscussion = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { vote } = req.body; // expect vote to be either 1 (upvote), -1 (downvote), or 0 (remove vote)
//   const userId = req.user.id; // Assuming user ID is available from the token

//   // Validate vote
//   if (![1, -1, 0].includes(vote)) {
//     return next(
//       new ApiError(
//         "Vote must be 1 (upvote), -1 (downvote), or 0 (remove vote).",
//         400
//       )
//     );
//   }

//   // Find the discussion
//   const discussion = await Discussion.findById(id);
//   if (!discussion) {
//     return next(new ApiError("Discussion not found.", 404));
//   }

//   // Check if the user has already voted
//   const existingVote = discussion.votes.find(
//     (v) => v.userId.toString() === userId
//   );

//   if (existingVote) {
//     if (vote === 0) {
//       // Remove the vote if vote is 0
//       discussion.votes = discussion.votes.filter(
//         (v) => v.userId.toString() !== userId
//       );
//     } else {
//       // Update the existing vote
//       existingVote.vote = vote;
//     }
//   } else {
//     // Add new vote
//     discussion.votes.push({ userId, vote });
//   }

//   // Save the discussion with the updated votes
//   await discussion.save();

//   // Calculate only upvotes
//   const upvotes = discussion.votes.filter((v) => v.vote === 1).length;

//   // Return success response
//   return res.status(200).json({
//     message: "Vote updated successfully.",
//     userVote: vote, // for ui to update the vote button
//     upvotes,
//   });
// });
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

  // Check if the user has already voted using the Vote model
  const existingVote = await Vote.findOne({ user: userId, discussion: id });

  if (existingVote) {
    if (vote === 0) {
      // Remove the vote if vote is 0
      await existingVote.deleteOne();
    } else {
      // -1 or 1
      // Update the existing vote
      existingVote.vote = vote;
      await existingVote.save();
    }
  } else {
    // Add new vote
    await Vote.create({ user: userId, discussion: id, vote });
  }

  // Calculate only upvotes
  const upvotes = await Vote.countDocuments({ discussion: id, vote: 1 });

  // Return success response
  return res.status(200).json({
    message: "Vote updated successfully.",
    userVote: vote, // for UI to update the vote button instantly when votes discussion api call
    upvotes, // for UI to update the upvote count
  });
});

// // getting status for particular discussion->  API not tested yet
// export const getVoteStatus = asyncHandler(async (req, res, next) => {
//   const { id } = req.params; // Discussion ID
//   const userId = req.user.id; // User ID from token

//   const userVote = await Vote.findOne({ userId, discussionId: id }).then(
//     (vote) => vote?.vote || 0
//   );
//   const upvotesCount = await Vote.countDocuments({ discussionId: id, vote: 1 });

//   return res.status(200).json({ userVote, upvotesCount });
// });
