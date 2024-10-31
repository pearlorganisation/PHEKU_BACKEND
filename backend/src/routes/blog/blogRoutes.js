import express from "express";
import {
  createBlogCategory,
  deleteBlogCategoryById,
  getBlogCategories,
  getBlogCategoryById,
  updateBlogCategoryById,
} from "../../controllers/blog/blogCategoryController.js";
import {
  createBlog,
  deleteBlogbyId,
  getAllBlogs,
  getBlogById,
  updateBlogById,
} from "../../controllers/blog/blogController.js";

const router = express.Router();

// Define the routes for BLOG
router
  .route("/")
  .post(createBlog) // Create a blog post
  .get(getAllBlogs); // Get all blog posts
  router
    .route("/categories")
    .post(createBlogCategory) // Create a blog category
    .get(getBlogCategories); // Get all blog categories

    // Define the routes for BLOG CATEGORY

    router
      .route("/categories/:id")
      .get(getBlogCategoryById) // Get a blog category by ID
      .delete(deleteBlogCategoryById) // Delete a blog category by ID
      .put(updateBlogCategoryById); // Update a blog category by ID


router
  .route("/:id")
  .get(getBlogById) // Get a blog post by ID
  .delete(deleteBlogbyId) // Delete a blog post by ID
  .put(updateBlogById); // Update a blog post by ID
 
export default router;
