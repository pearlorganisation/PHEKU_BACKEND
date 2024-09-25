import Course from "../models/course";
import { asyncHandler } from "../utils/asyncHandler";

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