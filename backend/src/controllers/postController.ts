import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import sharp from "sharp";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";

export const createPost = catchAsync(async (req, res, next) => {
  const { caption } = req.body;
  const image = req.file;
  const userId = (req as any).user._id;

  if (!image) return next(new AppError("Image is required for the post", 400));

  //  Optimize our image

  const optimizedImageBuffer = await sharp(image.buffer)
    .resize({
      width: 800,
      height: 800,
      fit: "inside",
    })
    .toFormat("jpeg", { quality: 80 })
    .toBuffer();

  const cloudResponse = await uploadToCloudinary(optimizedImageBuffer);

  let post = await Post.create({
    caption,
    image: {
      url: cloudResponse?.secure_url,
      publicId: cloudResponse?.public_id,
    },
    user: userId,
  });

  //  Add post to users posts
  const user = await User.findById(userId);

  if (user) {
    user.posts.push(post.id);
    await user.save({ validateBeforeSave: false });
  }

  post = await post.populate({
    path: "user",
    select: "username email bio profilePicture",
  });

  return res.status(200).json({
    status: "Success",
    message: "Post created",
    data: {
      post,
    },
  });
});
