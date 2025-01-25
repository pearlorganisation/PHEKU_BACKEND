import Discussion from "../../models/QnA Forum/discussion.js";
import Reply from "../../models/QnA Forum/reply.js";
import ReplyVote from "../../models/QnA Forum/replyVote.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const addReply = asyncHandler(async (req, res, next) => {
  const { discussionId } = req.params;
  const { text, parent, isDeleted } = req.body;

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
    isDeleted,
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
    .lean();

  if (!replies || replies.length === 0) {
    return next(new ApiError("No replies found for this discussion", 404));
  }

  // Fetch votes for all replies
  const replyIds = replies.map((reply) => reply._id);

  const votes = await ReplyVote.aggregate([
    { $match: { reply: { $in: replyIds } } },
    {
      $group: {
        _id: "$reply",
        totalUpvotes: { $sum: { $cond: [{ $eq: ["$vote", 1] }, 1, 0] } },
        // totalDownvotes: { $sum: { $cond: [{ $eq: ["$vote", -1] }, 1, 0] } },
      },
    },
  ]);
  console.log("---- ", votes);
  const voteMap = votes.reduce((acc, vote) => {
    acc[vote._id] = vote;
    return acc;
  }, {});
  console.log("---- ", voteMap);
  // Fetch user votes if authenticated
  const userVotes = req.user
    ? await ReplyVote.find({
        reply: { $in: replyIds },
        user: req.user._id,
      }).lean()
    : [];
  const userVoteMap = userVotes.reduce((acc, vote) => {
    acc[vote.reply] = vote.vote;
    return acc;
  }, {});

  // Build the parent-children hierarchy
  const replyMap = {};
  replies.forEach((reply) => {
    reply.children = [];
    const replyVotes = voteMap[reply._id] || {
      totalUpvotes: 0,
      totalDownvotes: 0,
    };
    reply.totalUpvotes = replyVotes.totalUpvotes;
    // reply.totalDownvotes = replyVotes.totalDownvotes;
    reply.userVote = userVoteMap[reply._id] || 0;
    replyMap[reply._id] = reply; // Map each reply by its ID
  });

  const result = [];
  replies.forEach((reply) => {
    if (reply.parent) {
      // Add reply to the parent's children array if parent exists
      if (replyMap[reply.parent]) {
        replyMap[reply.parent].children.push(reply);
      }
    } else {
      // If no parent, it's a top-level reply
      result.push(reply);
    }
  });

  // Return the hierarchical response
  return res
    .status(200)
    .json(new ApiResponse("Replies fetched successfully", result));
});
// export const getAllReplyForDiscussion = asyncHandler(async (req, res, next) => {
//   const { discussionId } = req.params;

//   // Validate discussion existence
//   const discussionExists = await Discussion.findById(discussionId);
//   if (!discussionExists) {
//     return next(new ApiError("Discussion not found", 404));
//   }

//   // Pagination support
//   const { page = 1, limit = 10 } = req.query;
//   const skip = (page - 1) * limit;

//   // Fetch all replies for the discussion, including soft-deleted ones
//   const replies = await Reply.find({ discussion: discussionId })
//     .populate("user", "fullName email")
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   if (!replies || replies.length === 0) {
//     return next(new ApiError("No replies found for this discussion", 404));
//   }

//   // Fetch votes for all replies
//   const replyIds = replies.map((reply) => reply._id);

//   const votes = await ReplyVote.aggregate([
//     { $match: { reply: { $in: replyIds } } },
//     {
//       $group: {
//         _id: "$reply",
//         totalUpvotes: { $sum: { $cond: [{ $eq: ["$vote", 1] }, 1, 0] } },
//       },
//     },
//   ]);

//   const voteMap = votes.reduce((acc, vote) => {
//     acc[vote._id] = vote;
//     return acc;
//   }, {});

//   // Fetch user votes if authenticated
//   const userVotes = req.user
//     ? await ReplyVote.find({
//         reply: { $in: replyIds },
//         user: req.user._id,
//       }).lean()
//     : [];
//   const userVoteMap = userVotes.reduce((acc, vote) => {
//     acc[vote.reply] = vote.vote;
//     return acc;
//   }, {});

//   // Build the parent-children hierarchy and handle soft-deleted replies
//   const result = [];
//   const replyMap = {};
//   replies.forEach((reply) => {
//     // Handle soft deletion
//     if (reply.isDeleted) {
//       reply.content = "[This reply has been deleted]";
//       reply.user = null; // Hide user details for deleted replies
//     }

//     reply.children = [];
//     const replyVotes = voteMap[reply._id] || { totalUpvotes: 0 };
//     reply.totalUpvotes = replyVotes.totalUpvotes;
//     reply.userVote = userVoteMap[reply._id] || 0;
//     replyMap[reply._id] = reply;

//     if (reply.parent) {
//       replyMap[reply.parent]?.children.push(reply); // Add to parent's children
//     } else {
//       result.push(reply); // Top-level replies
//     }
//   });

//   // Return the hierarchical response
//   return res
//     .status(200)
//     .json(new ApiResponse("Replies fetched successfully", result));
// });

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

// export const deleteReplyById = asyncHandler(async (req, res, next) => {
//   const { replyId } = req.params;

//   // Attempt to delete the reply with a filter
//   const result = await Reply.deleteOne({ _id: replyId, user: req.user.id }); // { acknowledged: true, deletedCount: 1 }
//   console.log(result);

//   if (!result.deletedCount) {
//     //deletedCount will be 0 if no doc deleted
//     return next(
//       new ApiError(
//         "Reply not found or you are not authorized to delete it",
//         404
//       )
//     );
//   }

//   // Return success response
//   return res.status(200).json(new ApiResponse("Reply deleted successfully"));
// });
export const deleteReplyById = asyncHandler(async (req, res, next) => {
  const { replyId } = req.params;

  // Attempt to soft delete the reply by setting deletedAt
  const result = await Reply.findByIdAndUpdate(
    replyId,
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(), // Optional, to track when it was deleted
      },
    },
    {
      new: true, // Returns the updated document
      runValidators: true, // Ensures validation rules are applied
    }
  );

  // Check if the reply was found and updated
  if (!result || result.user.toString() !== req.user.id) {
    return next(
      new ApiError(
        "Reply not found or you are not authorized to delete it",
        404
      )
    );
  }

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse("Reply soft deleted successfully"));
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
  const totalUpvotes = await ReplyVote.countDocuments({
    reply: replyId,
    vote: 1,
  });
  // Return success response
  return res.status(200).json(
    new ApiResponse("Vote recorded successfully", {
      userVote: vote,
      totalUpvotes,
    })
  );
});
