import express from "express";
import { voteOnReply } from "../../controllers/QnA Forum/replyController.js";
import { authenticateToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/:replyId/vote").post(authenticateToken, voteOnReply);

export default router;
