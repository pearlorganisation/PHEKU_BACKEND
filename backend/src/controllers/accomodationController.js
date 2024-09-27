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
/** to get all the accomodation */

export const getAllAccomodation = asyncHandler(async(req,res,next)=>{
  const data = await Accommodation.find();
  if(data.length ===0){
    return next(new ApiError("Unable to get the resources",400))
  }return res.status(200).json(new ApiResponse("Successfully retrieved the resources",data,200))
})


/** Get a single accomodation */

export const getAccomodationById = asyncHandler(async(req, res, next)=>{
const accomodationId = req.params?.id;
const data = await Accommodation.findById(accomodationId);
 if(!data){
    return next(new ApiError("Unable to get the data",400))
 }return res.status(200).json(new ApiResponse("Successfully retrieved the data",data,200))


})

/** delete a accomodation */
export const deleteAccomodationById = asyncHandler(async(req,res,next)=>{
  const accomodationId = req.params?.id;
  const data = await Accommodation.findByIdAndDelete(accomodationId);
  if(!data){
    return next(new ApiError("Unable to delete the resource",400))
  }return res.status(200).json(new ApiResponse("Successfully deleted the resource",data,200))
})

export const updateAccomodationById = asyncHandler(async(req,res,next)=>{
   const id = req.params?.id;
   const {
     name,
     type,
     location,
     capacity,
     availableSpaces,
     amenities,
     fees,
     description,
     contactInfo,
     owner

   } = req.body
 
 
  const data = await Accommodation.findByIdAndUpdate(id, {
  $set: {
    name,
    type,
    location,
    capacity,
    availableSpaces,
    amenities,
    "fees.monthly": fees?.monthly,
    "fees.securityDeposit": fees?.securityDeposit,
    description,
    "contactInfo.phone": contactInfo?.phone,
    "contactInfo.email": contactInfo?.email,
    "owner.name": owner?.name,
    "owner.phone": owner?.phone,
    "owner.email": owner?.email,
  }
});

if(!data){
  return next(new ApiError("Unable to update the data",404))
 }return res.status(200).json(new ApiResponse("Successfully update the resource",data,200));
})

 