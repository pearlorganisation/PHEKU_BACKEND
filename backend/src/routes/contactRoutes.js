import express from "express";
import {
  createContact,
  deleteContactById,
  getAllContacts,
} from "../controllers/contactController.js";

const router = express.Router();

router.route("/").post(createContact).get(getAllContacts);
router.route("/:id").delete(deleteContactById);

export default router;
