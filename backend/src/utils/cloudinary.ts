import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

export const uploadToCloudinary = async (fileUrl: string) => {
  try {
    const response = await cloudinary.uploader.upload(fileUrl);
    return response;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export { cloudinary };
