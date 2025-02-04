import Discussion from "../../models/QnA Forum/discussion.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Reply from "../../models/QnA Forum/reply.js";
import DiscussionVote from "../../models/QnA Forum/discussionVote.js";
import { paginate } from "../../utils/pagination.js";

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

export const voteDiscussion = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { vote } = req.body; // expect vote to be either 1 (upvote), -1 (downvote), or 0 (remove vote)
  const user = req.user.id; // Assuming user ID is available from the token

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
  const existingVote = await DiscussionVote.findOne({ user, discussion: id });

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
    await DiscussionVote.create({ user, discussion: id, vote });
  }

  // Calculate only upvotes
  const totalUpvotes = await DiscussionVote.countDocuments({
    discussion: id,
    vote: 1,
  });

  // userVote: for UI to update the vote button instantly when votes discussion api call
  // upvotes: for UI to update the upvote count
  return res.status(200).json(
    new ApiResponse("Vote recorded successfully", {
      userVote: vote,
      totalUpvotes,
    })
  );
});

// Get all discussion with total upvotes nad total comments
export const getAllDiscussions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { categories, tags } = req.query;

  let filter = {};

  // If category is provided, add it to the filter
  if (categories) {
    const categoryArr = categories.split(",");
    filter.category = { $in: categoryArr }; // Filter by category
  }

  // If tags are provided, add them to the filter (supporting multiple tags)
  if (tags) {
    const tagsArray = tags.split(","); // Tags should be passed as a comma-separated string
    filter.tags = { $in: tagsArray }; // Match any discussion with tags in the tagsArray
  }

  const { data: discussions, pagination } = await paginate(
    Discussion,
    page,
    limit,
    [{ path: "category" }, { path: "tags" }],
    filter
  );

  if (!discussions.length) {
    return res.status(200).json({
      message: "No discussions found",
      data: [],
      pagination,
    });
  }

  // Fetch total upvotes for each discussion
  const upvotes = await DiscussionVote.aggregate([
    {
      $match: {
        // Match votes related to the specific discussion (assuming `discussion` is the discussion ID)
        discussion: { $in: discussions.map((d) => d._id) },
        vote: 1,
      },
    },
    {
      $group: {
        _id: "$discussion",
        totalUpvotes: { $sum: 1 }, // Count upvotes per discussion
      },
    },
  ]);
  // Fetch total comments for each discussion
  const reply = await Reply.aggregate([
    {
      $match: {
        discussion: { $in: discussions.map((d) => d._id) }, // Match comments related to the discussions
      },
    },
    {
      $group: {
        _id: "$discussion",
        totalComments: { $sum: 1 }, // Count comments per discussion
      },
    },
  ]);

  let userVotes = [];
  if (req.user) {
    userVotes = await DiscussionVote.find({
      user: req.user._id,
      discussion: { $in: discussions.map((d) => d._id) },
    });
  }

  // Merge total upvotes and total comments with discussions
  const discussionsWithDetails = discussions.map((discussion) => {
    const upvoteData = upvotes.find(
      (upvote) => upvote._id.toString() === discussion._id.toString()
    );
    const replyData = reply.find(
      (Reply) => Reply._id.toString() === discussion._id.toString()
    );
    const userVote = userVotes.find(
      (vote) => vote.discussion.toString() === discussion._id.toString()
    );
    return {
      ...discussion.toObject(),
      totalUpvotes: upvoteData ? upvoteData.totalUpvotes : 0,
      totalComments: replyData ? replyData.totalComments : 0,
      userVote: userVote ? userVote.vote : 0,
    };
  });

  // Send response with discussions, total upvotes, and total comments
  return res.status(200).json({
    message: "Discussions fetched successfully",
    pagination,
    data: discussionsWithDetails,
  });
});

export const getDiscussionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Fetch the discussion details and populate user details
  const discussion = await Discussion.findById(id).populate({
    path: "user",
    select: "fullName email",
  });

  if (!discussion) {
    return next(new ApiError("Discussion not found", 404));
  }

  // Fetch total upvotes for the discussion
  const upvoteData = await DiscussionVote.aggregate([
    {
      $match: {
        discussion: discussion._id, // Match the specific discussion ID
        vote: 1, // Count only upvotes
      },
    },
    {
      $group: {
        _id: "$discussion",
        totalUpvotes: { $sum: 1 }, // Count upvotes
      },
    },
  ]);

  // Fetch total comments for the discussion
  const replyData = await Reply.aggregate([
    {
      $match: {
        discussion: discussion._id, // Match the specific discussion ID
      },
    },
    {
      $group: {
        _id: "$discussion",
        totalComments: { $sum: 1 }, // Count comments
      },
    },
  ]);

  // Fetch the user's vote on the discussion, if the user is authenticated
  let userVote = null;
  if (req.user) {
    const vote = await DiscussionVote.findOne({
      user: req.user._id,
      discussion: discussion._id,
    });
    userVote = vote ? vote.vote : 0;
  }

  // Add the aggregated details to the discussion object
  const discussionWithDetails = {
    ...discussion.toObject(),
    totalUpvotes: upvoteData.length ? upvoteData[0].totalUpvotes : 0,
    totalComments: replyData.length ? replyData[0].totalComments : 0,
    userVote, // User's vote on this discussion
  };

  // Send the response
  return res
    .status(200)
    .json(
      new ApiResponse("Discussion fetched successfully", discussionWithDetails)
    );
});
