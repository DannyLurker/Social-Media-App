var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import sharp from "sharp";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
export const createPost = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { caption } = req.body;
    const image = req.file;
    const userId = req.user._id;
    if (!image)
        return next(new AppError("Image is required for the post", 400));
    //  Optimize our image
    const optimizedImageBuffer = yield sharp(image.buffer)
        .resize({
        width: 800,
        height: 800,
        fit: "inside",
    })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();
    const cloudResponse = yield uploadToCloudinary(optimizedImageBuffer);
    let post = yield Post.create({
        caption,
        image: {
            url: cloudResponse === null || cloudResponse === void 0 ? void 0 : cloudResponse.secure_url,
            publicId: cloudResponse === null || cloudResponse === void 0 ? void 0 : cloudResponse.public_id,
        },
        user: userId,
    });
    //  Add post to users posts
    const user = yield User.findById(userId);
    if (user) {
        user.posts.push(post.id);
        yield user.save({ validateBeforeSave: false });
    }
    post = yield post.populate({
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
}));
export const getAllPost = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Ketika kamu menggunakan .populate() di Mongoose, data yang "diisi" itu hanya muncul di level aplikasi(saat apk di run), bukan disimpan permanen di database.
    const posts = yield Post.find()
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
}));
export const getUserPosts = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const posts = yield Post.find({
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
}));
