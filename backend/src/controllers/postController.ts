import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import sharp from "sharp";
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { Comment } from "../models/commentModel.js";

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

  if (!cloudResponse || !cloudResponse.secure_url || !cloudResponse.public_id) {
    return next(new AppError("Failed to upload image to Cloudinary", 500));
  }

  let post = await Post.create({
    caption,
    image: {
      url: cloudResponse.secure_url,
      publicId: cloudResponse.public_id,
    },
    user: userId,
  });

  //  Add post to users posts
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.posts.push(post._id);
  await user.save({ validateBeforeSave: false });

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

export const getAllPost = catchAsync(async (req, res, next) => {
  // Ketika kamu menggunakan .populate() di Mongoose, data yang "diisi" itu hanya muncul di level aplikasi(saat apk di run), bukan disimpan permanen di database.

  const posts = await Post.find()
    .populate({
      path: "user",
      select: "username profilePicture bio",
    })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePicture ",
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

export const getUserPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const posts = await Post.find({
    user: userId,
  })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePicure",
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: "successfull",
    results: posts.length,
    data: {
      posts,
    },
  });
});

export const saveOrUnSave = catchAsync(async (req, res, next) => {
  const userId = (req as any).user._id;
  const postId = req.params.postId;

  const user = await User.findById(userId);

  if (!user) return next(new AppError("User not found", 400));

  // Mengubah postId dari string menjadi ObjectId Karena includes() pada array ObjectId[] tidak bisa langsung mencocokkan string dengan ObjectId
  // includes(string) kadang bisa jalan, tapi nggak selalu aman, terutama di TypeScript dan untuk developer lain yang baca kodenya.
  const objectIdPost = new mongoose.Types.ObjectId(postId);

  const isPostSave = user.savedPosts.includes(objectIdPost);

  if (isPostSave) {
    (user.savedPosts as any).pull(objectIdPost);
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: "Success",
      message: "Post unsaved successfull",
      data: {
        user,
      },
    });
  } else {
    user.savedPosts.push(objectIdPost);
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: "Success",
      message: "Post saved successfull",
      data: {
        user,
      },
    });
  }
});

export const deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  const post = await Post.findById(id).populate("user");

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (post.user._id.toString() !== userId.toString()) {
    return next(
      new AppError("You are not authorized to delete this post", 403)
    );
  }

  // Remove this post from user posts
  await User.updateOne({ _id: userId }, { $pull: { post: id } });

  // Remove this post from user save list
  await User.updateMany({ savedPosts: id }, { $pull: { savedPosts: id } });

  // Remove the comment of this post
  await Comment.deleteMany({ post: id });

  // Remove from cloudinary
  if (post.image?.publicId) {
    await cloudinary.uploader.destroy(post.image.publicId);
  }

  // Remove the post
  await Post.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
  });
});
