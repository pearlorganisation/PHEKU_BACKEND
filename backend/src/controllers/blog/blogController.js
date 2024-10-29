import Blog from "../../models/blog/blog.js";
import BlogCategory from "../../models/blog/blogCategory.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new blog post
export const createBlog = asyncHandler(async (req, res, next) => {
  const { title, slug, thumbImage, content, author, category } = req.body;

  // Check if category exists
  const categoryExists = await BlogCategory.findById(category);
  if (!categoryExists) {
    return next(new ApiError("Invalid category ID", 400));
  }

  // Create a new blog post
  const blog = await Blog.create({
    title,
    slug,
    thumbImage,
    content,
    author,
    category,
  });

  if (!blog) {
    return next(new ApiError("Failed to create the blog post", 400));
  }

  return res
    .status(201)
    .json(new ApiResponse("Created the blog post successfully", blog));
});

// Get all blog posts
export const getAllBlogs = asyncHandler(async (req, res, next) => {
  const blogs = await Blog.find()
    .populate("author", "name email")
    .populate("category", "blogCategoryName")
    .sort({ publishedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse("Fetched all blog posts successfully", blogs));
});

// Get a single blog post by ID
export const getBlogById = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id)
    .populate("author", "name email")
    .populate("category", "blogCategoryName");

  if (!blog) {
    return next(new ApiError("Blog post not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Fetched the blog post successfully", blog));
});

// Update a blog post
export const updateBlogById = asyncHandler(async (req, res, next) => {
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedBlog) {
    return next(new ApiError("Blog post not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Updated the blog post successfully", updatedBlog));
});

// Delete a blog post
export const deleteBlogbyId = asyncHandler(async (req, res, next) => {
  const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

  if (!deletedBlog) {
    return next(new ApiError("Blog post not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse("Deleted the blog post successfully", deletedBlog));
});
