import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    user: {
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
    isDeleted: { type: Boolean, default: false },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Reply = mongoose.model("Reply", replySchema);

export default Reply;
