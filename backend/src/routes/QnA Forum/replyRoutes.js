import express from "express";
import {
  deleteReplyById,
  updateReplyById,
  voteOnReply,
} from "../../controllers/QnA Forum/replyController.js";
import { authenticateToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/:replyId/vote").post(authenticateToken, voteOnReply);
router
  .route("/:replyId")
  .patch(authenticateToken, updateReplyById)
  .delete(authenticateToken, deleteReplyById);

export default router;
