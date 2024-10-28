import express from "express";
import {
  createBlogCategory,
  deleteBlogCategoryById,
  getBlogCategories,
  getBlogCategoryById,
  updateBlogCategoryById,
} from "../../controllers/blog/blogCategoryController.js";

const router = express.Router();


// Define the routes for BLOG


// Define the routes for BLOG CATEGORY
router
  .route("/categories")
  .post(createBlogCategory) // Create a blog category
  .get(getBlogCategories); // Get all blog categories

router
  .route("/categories/:id")
  .get(getBlogCategoryById) // Get a blog category by ID
  .delete(deleteBlogCategoryById) // Delete a blog category by ID
  .put(updateBlogCategoryById); // Update a blog category by ID

export default router;
