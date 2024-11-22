import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reply",
      default: null,
    }, // Reference to parent reply
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    }, // Reference to discussion
  },
  { timestamps: true }
);

const Reply = mongoose.model("Reply", replySchema);

export default Reply;
