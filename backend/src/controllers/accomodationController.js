import Accommodation from "../models/accomodation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/** Accomodaation CRUD */
 

/** Create Accomodation */
export const createAccomodation = asyncHandler(async(req,res,next)=>{
  const { name, type, location, capacity, availableSpaces, amenities, fees, description, contactInfo, owner }= req.body;
 console.log(name)
  const accomodation = await Accommodation.create({
    name, type, location, capacity, availableSpaces, amenities, fees, description, contactInfo, owner });
  const data = await accomodation.save();
  if(!data){
    return next(new ApiError("Failed to create the Accomodation",400))
  }return res.status(200).json(new ApiResponse("Created the Accomodation Successfully",data, 200));
})

/** Get a single accomodation */

export const getAccomodationById = asyncHandler(async(req, res, next)=>{
const accomodationId = req.params?.id;
const data = await Accommodation.findById(accomodationId);
 if(!data){
    return next(new ApiError("Unable to get the data",400))
 }return res.status(200).json(new ApiResponse("Successfully retrieved the data",data,200))


})