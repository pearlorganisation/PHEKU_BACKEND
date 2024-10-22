import Contact from "../models/contact.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const createContact = asyncHandler(async(req,res,next)=>{
    const {name, email, subject, mobile, message} = req.body
    if(!name || !email || !subject || !mobile || !message){
        return next(new ApiError("Require all the fields"))
    }const contact = new Contact({name, email, subject,mobile, message});
    const createdContact = await contact.save()
    res.status(200).json(new ApiResponse("Submitted the Contact",
        createdContact,200
    ));
})