import { z } from "zod"

/*-------------------------------------Signup--------------------------------------------------- */
export const signUpValidation = z.object({
    fullName: z.string().min(1, "Atleast 1 character is required"),
    email: z.string().email(),
    password: z.string().min(6, "Minimam 6 character required"),
    mobileNumber: z.string().min(10, "At least 1 character")
        .regex(/^\+?[1-9]\d{1,14}$/, {
            message: "Invalid phone number format"
        }),
})

/*----------------------------------------------update-password------------------------------------ */

export const updateValidation = z.object({
    newPassword: z.string().min(6, "Atleast 6 characters required")
});

/*----------------------------------------------Contact-Us Validator------------------------------------ */
// name, email, subject, mobile, message
export const validContact = z.object({
  name: z.string().min(1, "Atleast 1 chatracter is required"),
  email: z.string().email(),
  subject: z.string().min(1, "Atleast 10 character are required"),
  mobile: z.string().length(10, "Enter a valid number"),
  message: z.string().length(1,"Enter a valid message")
})
