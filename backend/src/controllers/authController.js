import { COOKIE_OPTIONS } from "../../constants.js";
import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { z } from 'zod'
import bcrypt from 'bcrypt'
// will add validation here
const signUpValidation = z.object({
  fullName: z.string().min(1,"Atleast 1 character is required"),
  email: z.string().email(),
  password: z.string().min(6,"Minimam 6 character required"),
  mobileNumber: z.string().min(10, "At least 1 character")
    .regex(/^\+?[1-9]\d{1,14}$/, {
      message: "Invalid phone number format"
    }),
})
export const signup = asyncHandler(async (req, res, next) => {
  const {
    fullName,
    email,
    password,
    mobileNumber,
    role
  } = req.body;

  // Validation
  try {
    const validatedData = signUpValidation.parse({
      fullName,
      email,
      password,
      mobileNumber
    });
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

  // Check if the user already exists
  const existingUser = await User.findOne({
    email
  });
  if (existingUser) {
    return next(new ApiError("User already exists", 400));
  }

  // Create new user after successful validation
  const newUser = await User.create({
    fullName,
    email,
    password,
    role,
    mobileNumber,
  });

  // Generate access and refresh tokens
  const access_token = newUser.generateAccessToken();
  const refresh_token = newUser.generateRefreshToken();
  newUser.refreshToken = refresh_token; // Save new refresh token

  await newUser.save({
    validateBeforeSave: false
  });

  // Set cookies and send response
  res
    .cookie("access_token", access_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    })
    .cookie("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    })
    .status(201)
    .json({
      success: true,
      message: "Signup successful, and logged in successfully",
    });
});


export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req?.body;
  if (!email || !password) {
    return next(new ApiError("All fields are required", 400));
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser) return next(new ApiError("No user found", 400));

  const isValidPassword = await existingUser.isPasswordCorrect(password);

  if (!isValidPassword) {
    return next(new ApiError("Wrong password", 400));
  }

  const access_token = existingUser.generateAccessToken();
  const refresh_token = existingUser.generateRefreshToken();

  existingUser.refreshToken = refresh_token;
  await existingUser.save({ validateBeforeSave: false });

  res
    .cookie("access_token", access_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), //1day set 15min later on
    })
    .cookie("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15day
    })
    .status(200)
    .json(new ApiResponse("Logged in successfully", null, 200));
});

export const logout = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  res
    .cookie("access-token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
    .cookie("refresh-token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
    .status(200)
    .json(new ApiResponse("Logout successfully", null, 200));
});

/*------------------------------------------------Handler for updating the password after Login----------------------------------------*/

/*----------------------------------------------------------- Update password Validation----------------------------------------------- */
const updateValidation= z.object({
  newPassword: z.string().min(6,"Atleast 6 characters required")
})

export const updatePassword = asyncHandler(async(req,res,next)=>{
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  
  if(!user){
    return next(new ApiError("User is not logged in",400))
  }else{
    const isMatch = await user.isPasswordCorrect(currentPassword)
    if(!isMatch){
      return next(new ApiError("Entered wrong current password",400))
    }try {
      const validate = updateValidation.parse({ newPassword })
      console.log(validate);
    } catch (error) {
       if (error instanceof z.ZodError) {
         console.error("Validation errors:", error.errors);
         return next(new ApiError("Validation failed", 400)); // Send a validation error response
       } else {
         console.error("An unexpected error occurred:", error);
         return next(new ApiError("An unexpected error occurred", 500)); // Handle unexpected errors
       }
    }
    user.password = newPassword;
    await user.save()
    return res.status(200).json(new ApiResponse("Password reset successfull",null,200));
  }
})