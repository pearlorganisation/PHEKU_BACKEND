import mongoose from "mongoose";

const discussionTagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Tag name
    category: {
      // While creating tag from admin panel to associate only relevent tag with particular category
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionCategory",
      required: true,
    },
  },
  { timestamps: true }
);

const DiscussionTag = mongoose.model("DiscussionTag", discussionTagSchema);

export default DiscussionTag;
