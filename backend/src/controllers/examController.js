import e from "express";
import Exam from "../models/exam.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


/** CRUD OPERATIONS */

// CREATE EXAM
export const createExam = asyncHandler(async(req,res,next)=>{
    const { title, course, description, date, duration, location, invigilator, instructions } = req.body;
    
    const data = await Exam.create({
        title,
        course,
        description,
        date,
        duration,
        location,
        invigilator,
        instructions
    })
    if(data.length ===0){
        return next(new ApiError("Couldn't create Exam",400))
    }return res.status(200).json(new ApiResponse("Successfully created the Exam",data,200));
})

// GET //

export const getExam = asyncHandler(async(req,res,next)=>{
    const data = await Exam.find();
    if(data.length===0){
        return next(new ApiError("Failed to retrive the data", 404))
    }return res.status(200).json(new ApiResponse("Retrived the data successfully",data, 200));
});

// Get by Id //

export const examById = asyncHandler(async(req,res,next)=>{
    const data = await Exam.findById(req.params?.id);
    if(!data){
        return next(new ApiError("Failed to retrive the data",400))
    }return res.status(200).json(new ApiResponse("Successfully retrieved the data",data,200))
})

// DELETE BY ID //

export const examDeleteById= asyncHandler(async(req,res,next)=>{
    const data = await Exam.findByIdAndDelete(req.params?.id)
    
    if(!data){
        return next(new ApiError("Unable to delete the Exam",400))
    }return res.status(200).json(new ApiResponse("Successfully removed the Exam",null, 200))
      
})

// UPDATE BY ID //

export const  examUpdateById= asyncHandler(async(req,res,next)=>{
    const data = await Exam.findByIdAndUpdate(req.params?.id,req.body,{ new: true });
    if(!data){
       return next(new ApiError("Unable to update the Exam",400))
    }return res.status(200).json(new ApiResponse("Successfully updated the the Exam",data, 200))
})