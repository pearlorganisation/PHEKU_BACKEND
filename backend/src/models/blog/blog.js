import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    thumbImage: {
      asset_id: { type: String, required: true },
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    //tags: [String], Can make different endpoint. Will do it later if needed.
  },
  {
    timestamps: { createdAt: "publishedAt", updatedAt: "updatedAt" },
  }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
