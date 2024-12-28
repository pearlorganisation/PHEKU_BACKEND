import express from "express";
import {
  createDiscussion,
  voteDiscussion,
} from "../../controllers/QnA Forum/discussionController.js";
import { authenticateToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(createDiscussion);
router.route("/:id/vote").patch(authenticateToken, voteDiscussion);

export default router;
