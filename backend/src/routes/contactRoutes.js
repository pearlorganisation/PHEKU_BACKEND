import express from "express";
import {
  createContact,
  deleteContactById,
} from "../controllers/contactController.js";

const router = express.Router();

router.route("/").post(createContact);
router.route("/:id").delete(deleteContactById);

export default router;
