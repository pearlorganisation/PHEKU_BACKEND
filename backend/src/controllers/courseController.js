import Course from "../models/course.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import University from "../models/university.js";
 
// Create course handle
export const createCourse = asyncHandler(async (req, res) => {
    const { title, universitySlug, slug, duration, courseLevel, examType, fees, location, specialization } = req.body;
  
    // Find the university by its slug
    const university = await University.findOne({ slug: universitySlug });
  
    if (!university) {
      res.status(404);
      throw new Error("University not found");
    }
  
    // Check if the course already exists in the same university
    const courseExists = await Course.findOne({ title, university: university._id });
  
    if (courseExists) {
      res.status(400);
      throw new Error("Course already exists in the University");
    }
  
    // Create a new course with the university reference
    const course = new Course({
      title,
      university: university._id, // Referencing the university by ObjectId
      slug,
      duration,
      courseLevel,
      examType,
      fees,
      location,
      specialization,
    });
  if(!course){
    return res.status(400).json("Unable to create Course",400)
  } const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  });
  

// to get all the course
export const getAllCourse =  asyncHandler(async(req,res)=>{

    const course = await Course.find();
    if(course.length ===0){
        res.status(400);
        throw new Error("No Course Found")
    }
    res.status(200).json(course)
})

// to get the course by id

export const getCourseById = asyncHandler(async(req,res)=>{
    const course = await Course.findById(req.params?.id)
    if(!course){
        res.status(400);
        throw new Error("Course not found")
    }return res.status(200).json(course);
})


export const deleteById= asyncHandler(async(req,res,next)=>{
    const remCourse = await Course.findByIdAndDelete(req.params?.id);

    if(!remCourse){
    throw new Error("No Course found")
    } return res
    .status(200)
    .json("Course deleted successfully", null, 200);;
})