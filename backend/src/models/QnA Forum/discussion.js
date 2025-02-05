import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionCategory",
      required: true,
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "DiscussionTag" }], // User selcted tag while creating discussion
  },
  { timestamps: true }
);

const Discussion = mongoose.model("Discussion", discussionSchema);

export default Discussion;
