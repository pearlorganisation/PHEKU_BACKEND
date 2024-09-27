import express from "express";
import { createAccomodation } from "../controllers/accomodationController.js";

const router = express.Router();

router.route("/create").post(createAccomodation);

export default router;