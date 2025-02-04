import express from "express";
import {
  createDiscussionTag,
  deleteDiscussionTagById,
  getAllDiscussionTags,
  getDiscussionTagById,
  updateDiscussionTagById,
} from "../../controllers/QnA Forum/discussionTagController.js";

const router = express.Router();

// Define the routes
router
  .route("/")
  .post(createDiscussionTag) // Create a discussion tag
  .get(getAllDiscussionTags); // Get all discussion tags | qyery by category

router
  .route("/:id")
  .get(getDiscussionTagById) // Get a discussion tag by ID
  .put(updateDiscussionTagById) // Update a discussion tag by ID
  .delete(deleteDiscussionTagById); // Delete a discussion tag by ID

export default router;
