import express from "express";
import {
  createDiscussion,
  getAllDiscussions,
  getDiscussionById,
  voteDiscussion,
} from "../../controllers/QnA Forum/discussionController.js";
import {
  authenticateToken,
  optionalAuthenticateToken,
} from "../../middlewares/authMiddleware.js";
import {
  addReply,
  deleteReplyById,
  getAllReplyForDiscussion,
  updateReplyById,
} from "../../controllers/QnA Forum/replyController.js";

const router = express.Router();

router
  .route("/")
  .post(authenticateToken, createDiscussion)
  .get(optionalAuthenticateToken, getAllDiscussions);
router.route("/:id").get(optionalAuthenticateToken, getDiscussionById);
router.route("/:id/vote").patch(authenticateToken, voteDiscussion);
router
  .route("/:discussionId/replies")
  .post(authenticateToken, addReply)
  .get(optionalAuthenticateToken, getAllReplyForDiscussion);

router
  .route("/reply/:replyId")
  .patch(authenticateToken, updateReplyById)
  .delete(authenticateToken, deleteReplyById);

//Vote on reply

export default router;
