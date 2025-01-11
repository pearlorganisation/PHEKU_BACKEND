import express from "express";
import {
  createDiscussion,
  voteDiscussion,
} from "../../controllers/QnA Forum/discussionController.js";
import { authenticateToken } from "../../middlewares/authMiddleware.js";
import {
  addReply,
  deleteReplyById,
  getAllReplyForDiscussion,
  updateReplyById,
} from "../../controllers/QnA Forum/replyController.js";

const router = express.Router();

router.route("/").post(authenticateToken, createDiscussion);
router.route("/:id/vote").patch(authenticateToken, voteDiscussion); // separae schema for voting
// router.route("/:id/vote-status").get(authenticateToken, getVoteStatus);
router
  .route("/:discussionId/reply")
  .post(authenticateToken, addReply)
  .get(getAllReplyForDiscussion);

router
  .route("/reply/:replyId")
  .patch(authenticateToken, updateReplyById)
  .delete(authenticateToken, deleteReplyById);

//Vote on reply

export default router;
