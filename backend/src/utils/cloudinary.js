import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    }); // {} || [{}, {}]
    //UNLINK File if necessary when stored local
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id,
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export const uploadFileToCloudinary = async (files) => {
  try {
    const isMultipleImages = Array.isArray(files);
    const imageFiles = isMultipleImages ? files : [files];
    const uploadPromises = imageFiles.map((file) =>
      uploadImage(file?.filepath)
    ); // [{},{},..]
    const uploadResults = await Promise.all(uploadPromises);

    return uploadResults; //[{ url: result.secure_url, id: result.public_id }, {        }];
  } catch (error) {
    throw new Error(error.message);
  }
};
