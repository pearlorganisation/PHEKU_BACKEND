import mongoose from "mongoose";

const discussionCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const DiscussionCategory = mongoose.model(
  "DiscussionCategory",
  discussionCategorySchema
);

export default DiscussionCategory;
