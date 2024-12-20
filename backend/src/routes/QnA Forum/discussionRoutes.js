import express from "express";
import {
  createDiscussion,
  getVoteStatus,
  voteDiscussion,
} from "../../controllers/QnA Forum/discussionController.js";
import { authenticateToken } from "../../middlewares/authMiddleware.js";
import {
  addReply,
  getAllReplyForDiscussion,
} from "../../controllers/QnA Forum/replyController.js";

const router = express.Router();

router.route("/").post(createDiscussion);
router.route("/:id/vote").patch(authenticateToken, voteDiscussion);
router.route("/:id/vote-status").get(authenticateToken, getVoteStatus);
router
  .route("/:discussionId/reply")
  .post(authenticateToken, addReply)
  .get(getAllReplyForDiscussion);

export default router;
