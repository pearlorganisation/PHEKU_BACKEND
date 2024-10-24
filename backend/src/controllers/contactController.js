import Contact from "../models/contact.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { validContact } from "../utils/Validation.js";
import { z } from "zod";

export const createContact = asyncHandler(async(req,res,next)=>{
    const {name, email, subject, mobile, message} = req.body;
    // will check the body data and parse according to the validator
    try {
        const validatedData = validContact.parse({
          name, email, subject, mobile, message });
        console.log("Validated data:", validatedData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Validation errors:", error.errors);
            return next(new ApiError("Validation failed", 400)); // Send a validation error response
        } else {
            console.error("An unexpected error occurred:", error);
            return next(new ApiError("An unexpected error occurred", 500)); // Handle unexpected errors
        }
    }
    const contact = new Contact({name, email, subject,mobile, message});
    const createdContact = await contact.save()
    res.status(200).json(new ApiResponse("Submitted the Contact",
        createdContact,200
    ));
})