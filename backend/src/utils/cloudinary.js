import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to handle single or multiple file uploads
export const uploadFileToCloudinary = async (files) => {
  try {
    // Ensure files is always an array for uniform processing
    const fileArray = Array.isArray(files) ? files : [files];

    // Map each file to the upload function
    const uploadPromises = fileArray.map((file) =>
      cloudinary.uploader.upload(file.path)
    );

    // Wait for all promises (uploads) to complete
    const uploadResults = await Promise.all(uploadPromises);

    // Map and return only the necessary details from the upload results
    return uploadResults.map((result) => ({
      secure_url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id,
    }));
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};
