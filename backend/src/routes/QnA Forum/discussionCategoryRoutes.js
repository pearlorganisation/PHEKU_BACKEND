import express from "express";
import {
  createDiscussionCategory,
  deleteDiscussionCategoryById,
  getAllDiscussionCategories,
  getDiscussionCategoryById,
  updateDiscussionCategoryById,
} from "../../controllers/QnA Forum/discussionCategoryController.js";

const router = express.Router();

// Define the routes
router
  .route("/")
  .post(createDiscussionCategory) // Create a discussion category
  .get(getAllDiscussionCategories); // Get all discussion categories | query: pagination, search by name for admin |

router
  .route("/:id")
  .get(getDiscussionCategoryById) // Get a discussion category by ID
  .delete(deleteDiscussionCategoryById) // Delete a discussion category by ID
  .put(updateDiscussionCategoryById); // Update a discussion category by ID

export default router;
