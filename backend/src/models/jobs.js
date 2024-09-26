// schema for jobs and internship

import mongoose from "mongoose";

const jobInternshipSchema =  new mongoose.Schema({
   
     title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      type: {
        type: String, // 'job' or 'internship'
        enum: ["job", "internship"],
        required: true,
      },
      description: {
        type: String,
      },
      duration: {
        minDuration: {
          type: Number, // in months
        },
        maxDuration: {
          type: Number, // in months
        },
      },
      salary: {
        minSalary: {
          type: String, // could be a string like "5000 USD" or "50k"
        },
        maxSalary: {
          type: String,
        },
      },
      location: {
        type: String,
        required: true,
      },
      skillsRequired: [
        {
          label: String,
          slug: String,
        },
      ],
      applicationDeadline: {
        type: Date,
      },
      postedDate: {
        type: Date,
        default: Date.now,
      },
      applyLink: {
        type: String,
      },
    },
    { timestamps: true }
)


const JobInternship = mongoose.model("JobInternship", jobInternshipSchema);
export default JobInternship;