import express from "express";
import {
  createDiscussion,
  getVoteStatus,
  voteDiscussion,
} from "../../controllers/QnA Forum/discussionController.js";
import { authenticateToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(createDiscussion);
router.route("/:id/vote").patch(authenticateToken, voteDiscussion);
router.route("/:id/vote-status").get(authenticateToken, getVoteStatus);

export default router;
