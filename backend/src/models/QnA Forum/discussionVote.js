import mongoose from "mongoose";

const discussionVoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    vote: {
      type: Number,
      enum: [-1, 1, 0], // -1 for downvote, 1 for upvote, 0 for no vote
      required: true,
    },
  },
  { timestamps: true }
);

const DiscussionVote = mongoose.model("DiscussionVote", discussionVoteSchema);

export default DiscussionVote;
