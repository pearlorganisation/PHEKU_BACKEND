import JobInternship from "../models/jobs.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// to create a job or internship

export const createJob = asyncHandler(async(req,res,next)=>{
    const {title , company, type, description, duration, salary, location, skillsRequired, applicationDeadline, postedDate, applyLink } =  req.body

    const job = new JobInternship({
        title , company, type, description, duration, salary, location, skillsRequired, applicationDeadline, postedDate, applyLink,
    })
    const jobCreated = await job.save();
     if(!jobCreated){
        return next(new ApiError("Failed to create the user",400))
     }return res.status(201).json(new ApiResponse("Created Successfully",jobCreated,200));
})

// handl to fetch all

export const getAllJob= asyncHandler(async(req,res,next)=>{
    const getJobs= await JobInternship.find();
    
    if(getJobs.length === 0){
        return next(new ApiError("Unable to get the jobs/internships",404))
    }
    return res.status(200).json(new ApiResponse("Fetched all the jobs",getJobs,200))
})

// get by id
export  const getJobById = asyncHandler(async(req,res,next)=>{
    const jobId = req.params?.id;
    const job = await JobInternship.findById(jobId);
    if(!job){
        return next(new ApiError("Unable to get the Job/Internship",404))
    }
    return res.status(200).json(new ApiResponse("Fetched the Job/Internship",job,200))
})

// delete by id

export const deleteJobById = asyncHandler(async(req,res,next)=>{
    const id = req.params.id;
    const deleteJob = await JobInternship.findByIdAndDelete(id);
    
    if(!deleteJob){
        return next(new ApiError("Failed to delete the Job/Internship",400))
    }
    return res.status(200).json(new ApiResponse("Successfully removed",null,200))
})


// handle to update Job/Internship

export const updateJobById = asyncHandler(async(req,res,next)=>{
    const jobId = req.params?.id; // Get the job/internship ID from the request parameters
    const {
      title,
      company,
      type,
      description,
      duration,
      salary,
      location,
      skillsRequired,
      applicationDeadline,
      applyLink,
    } = req.body;
  
    try {
      // Find the job/internship by ID and update the relevant fields
      const updatedJobInternship = await JobInternship.findByIdAndUpdate(
        jobId,
        {
          $set: {
            title,
            company,
            type,
            description,
            "duration.minDuration": duration?.minDuration,
            "duration.maxDuration": duration?.maxDuration,
            "salary.minSalary": salary?.minSalary,
            "salary.maxSalary": salary?.maxSalary,
            location,
            skillsRequired,
            applicationDeadline,
            applyLink,
          },
        },
        { new: true, runValidators: true } // Return the updated document and run validation checks
      );
  
      if (!updatedJobInternship) {
        return res.status(404).json({ message: 'Job/Internship not found' });
      }
  
      // Respond with the updated document
      res.status(200).json(updatedJobInternship);
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
})