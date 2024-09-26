import express from 'express';
import { createJob, deleteJobById, getAllJob, getJobById, updateJobById } from '../controllers/jobInternshipController.js';

const router = express.Router();

router.route("/").post(createJob).get(getAllJob);
router.route("/:id").get(getJobById).delete(deleteJobById).patch(updateJobById)
export default router