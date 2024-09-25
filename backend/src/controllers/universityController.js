import University from "../models/university.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createUniversity = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    location,
    highlights,
    overview,
    contactInfo,
    ranking,
    courses,
    faculties,
  } = req.body;

  const universityExists = await University.findOne({ name });

  if (universityExists) {
    res.status(400);
    throw new Error("University already exists");
  }

  const university = new University({
    name,
    slug,
    location,
    highlights,
    overview,
    contactInfo,
    ranking,
    courses,
    faculties,
  });

  const createdUniversity = await university.save();
  res.status(201).json(createdUniversity);
});

export const getAllUniversities = asyncHandler(async (req, res) => {
  const universities = await University.find();

  if (universities.length === 0) {
    res.status(404);
    throw new Error("No universities found");
  }

  res.status(200).json(universities);
});
