import express from "express";
import { createAccomodation, deleteAccomodationById, getAccomodationById, getAllAccomodation, updateAccomodationById } from "../controllers/accomodationController.js";

const router = express.Router();

router.route("/").post(createAccomodation).get(getAllAccomodation);
router.route("/:id").get(getAccomodationById).delete(deleteAccomodationById).patch(updateAccomodationById)

export default router;