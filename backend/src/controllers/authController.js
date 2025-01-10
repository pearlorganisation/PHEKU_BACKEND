import { AVAILABLE_USER_ROLES, COOKIE_OPTIONS } from "../../constants.js";
import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signUpValidation, updateValidation } from "../utils/Validation.js";
import AdministrativeUser from "../models/AdministrativeUser.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, mobileNumber, role } = req.body;

  // Validation
  try {
    const validatedData = signUpValidation.parse({
      fullName,
      email,
      password,
      mobileNumber,
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
    email,
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
    validateBeforeSave: false,
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
    .json(new ApiResponse("Logged in successfully"));
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
    .json(new ApiResponse("Logout successfully"));
});

// Not done yet
// export const createUserByAdmin = asyncHandler(async (req, res, next) => {
//   const {
//     email,
//     role,
//     isInvited, // Admin will provide the role
//   } = req.body;
//   console.log(req.body);
//   // Check if the user already exists
//   const existingUser = await User.findOne({
//     email,
//   });

//   if (existingUser) {
//     return next(new ApiError("User already exists", 400));
//   }

//   // if (isInvited) {
//   //   const token = jwt.sign(
//   //     { email, role },
//   //     process.env.JWT_SECRET_KEY, // Secret key
//   //     { expiresIn: "7d" } // Token valid for 7 days
//   //   );

//   //   // Create the invitation link
//   //   const inviteLink = `${process.env.FRONTEND_URL}/signup?token=${token}`;
//   //   const transporter = createTransport({
//   //     host: "smtp.gmail.com",
//   //     port: 465,
//   //     service: "gmail",
//   //     auth: {
//   //       user: process.env.NODEMAILER_EMAIL_USER,
//   //       pass: process.env.NODEMAILER_EMAIL_PASS,
//   //     },
//   //   });

//   //   let mailOptions = {
//   //     from: process.env.NODEMAILER_MAIL,
//   //     to: email,
//   //     subject: "You’re Invited!",
//   //     html: `
//   //     <p>You have been invited to join our platform as a <b>${role}</b>.</p>
//   //     <p>Click <a href="${inviteLink}">here</a> to complete your registration.</p>
//   //   `,
//   //   };
//   //   transporter.sendMail(mailOptions, (error, info) => {
//   //     if (error) {
//   //       return reject(error);
//   //     } else {
//   //       return resolve("Mail sent Successfully");
//   //     }
//   //   });
//   //   // return new Promise((resolve, reject) => {

//   //   // });
//   // }
//   // Create a new user with minimal details
//   const newUser = await AdministrativeUser.create({
//     email,
//     role: "ADMIN", // Assign the role as provided by the admin
//     isInvited: true, // Mark as invited
//     status: "PENDING", // Set status to PENDING until registration is completed
//   });
//   res.status(201).json(newUser);
// });

export const createUserByAdmin = asyncHandler(async (req, res, next) => {
  const { email, role, isInvited } = req.body;
  console.log(AVAILABLE_USER_ROLES);
  if (!AVAILABLE_USER_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role: ${role}. Must be one of ${AVAILABLE_USER_ROLES.join(
        ", "
      )}`,
    });
  }

  const user = await AdministrativeUser.create({
    email,
    role, // Use the role from body
    isInvited,
  });
  console.log(user);
  res.status(201).json(user);
});
