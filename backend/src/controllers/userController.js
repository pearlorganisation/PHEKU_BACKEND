import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMail } from "../utils/nodemailerConfig.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"; 
import ejs  from 'ejs'
import path from 'path'
import {
  fileURLToPath
} from 'url';

// Get the __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//Get user details Contoller
export const getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    return next(new ApiError("User is not found", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("User found successfully", user, 200));
});

export const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params?.id).select(
    "-password -refreshToken"
  );
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("User found successfully", user, 200));
});

export const deleteUserById = asyncHandler(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params?.id);
  if (!deletedUser) {
    return next(new ApiError("User is not deleted", 404));
  }
  return res
    .status(200)
    .json(new ApiResponse("User deleted successfully", null, 200));
});

/**-------------------------------------- For Handling Forgot Password---------------------------------------------------*/

/* Handlers for forgotten and reset password */

export const forgotPassword = asyncHandler(async(req,res,next)=>{
  const { email } = req.body;
  const user = await User.findOne({ email });
  const filePath =
      path.join(__dirname, '../../views/emails/resetPassword.ejs')
  console.log(filePath)
  if(!user){
    return next(new ApiError("Email is not registered",404))
  }
    const resetToken = jwt.sign({_id: user._id}, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h'
    });
    // Construct reset URL
    const resetLink = `http://your-app-url/reset-password/${resetToken}`;
    const htmlContent = await ejs.renderFile(filePath,{ resetLink }) 
    const data = await sendMail(email,htmlContent);
    if(!data){
    return next(new ApiError("Unable to send the reset mail",400))
  }return res.status(200).json(new ApiResponse("Successfully sent the mail please check your emal",data,200));
})

 // handler to reset the password received from the resetform //

export const resetPassword = asyncHandler(async(req,res,next)=>{
  // extract reset token //
    const { resetToken } = req.params
    const { newPassword } = req.body

    let decoded;
    try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET_KEY);
    } catch (error) {
      return next(new ApiError("Invalid or expired reset token!", 400));
    }

  // Find the user by their _id decoded from the token
    const user = await User.findById(decoded._id);
    console.log("User found",user);
    if (!user) {
      return next(new ApiError("User not found!", 404));
    }

  // Update the user's password
    user.password = newPassword; 
    await user.save();  

    res.status(200).json(new ApiResponse("Password reset successfull",null, 200));
  })