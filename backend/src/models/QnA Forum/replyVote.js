import mongoose from "mongoose";

const replyVoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reply",
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

const ReplyVote = mongoose.model("ReplyVote", replyVoteSchema);

export default ReplyVote;
