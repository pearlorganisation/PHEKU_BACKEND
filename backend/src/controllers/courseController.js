import Course from "../models/course.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// to create a course 
export const createCourse =asyncHandler(async(req,res)=>{

    const { title, university, slug, duration, courseLevel, examType, fees, location , specialization} = req.body;
  // to check if the course already exists
  const courseExists = await Course.findOne({ title });
  const sameUniverity = await Course.findOne({ university });
if(courseExists && sameUniverity){
    res.status(400);
    throw new Error("Course already exists in the University");
}const course = new Course({ title, university, slug, duration,    courseLevel, examType, fees, location , specialization})

    const createdCourse = await course.save();
    res.status(201).json(createdCourse)

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

export const getCourseById = asyncHandler(async(req,res,next)=>{
    const course = await Course.findById(req.params?.id)
    if(!course){
        return next(new ApiError("Unable to get the course",404))
    }return res.status(200).json(new ApiResponse("Course Found",course,200))
})


export const deleteById= asyncHandler(async(req,res,next)=>{
    const remCourse = await Course.findByIdAndDelete(req.params?.id);

    if(!remCourse){
        return next(new ApiError("Failed to delete the course",404))
    } return res
    .status(200)
    .json("Course deleted successfully", null, 200);;
})