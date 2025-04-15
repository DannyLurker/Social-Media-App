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
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { Comment } from "../models/commentModel.js";
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
    if (!cloudResponse || !cloudResponse.secure_url || !cloudResponse.public_id) {
        return next(new AppError("Failed to upload image to Cloudinary", 500));
    }
    let post = yield Post.create({
        caption,
        image: {
            url: cloudResponse.secure_url,
            publicId: cloudResponse.public_id,
        },
        user: userId,
    });
    //  Add post to users posts
    const user = yield User.findById(userId);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    user.posts.push(post._id);
    yield user.save({ validateBeforeSave: false });
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
export const saveOrUnsave = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const postId = req.params.postId;
    const user = yield User.findById(userId);
    if (!user)
        return next(new AppError("User not found", 400));
    // Mengubah postId dari string menjadi ObjectId Karena includes() pada array ObjectId[] tidak bisa langsung mencocokkan string dengan ObjectId
    // includes(string) kadang bisa jalan, tapi nggak selalu aman, terutama di TypeScript dan untuk developer lain yang baca kodenya.
    const objectIdPost = new mongoose.Types.ObjectId(postId);
    const isPostSave = user.savedPosts.includes(objectIdPost);
    if (isPostSave) {
        user.savedPosts.pull(objectIdPost);
        yield user.save({ validateBeforeSave: false });
        return res.status(200).json({
            status: "Success",
            message: "Post unsaved successfull",
            data: {
                user,
            },
        });
    }
    else {
        user.savedPosts.push(objectIdPost);
        yield user.save({ validateBeforeSave: false });
        return res.status(200).json({
            status: "Success",
            message: "Post saved successfull",
            data: {
                user,
            },
        });
    }
}));
export const deletePost = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = req.user._id;
    const post = yield Post.findById(id).populate("user");
    if (!post) {
        return next(new AppError("Post not found", 404));
    }
    if (post.user._id.toString() !== userId.toString()) {
        return next(new AppError("You are not authorized to delete this post", 403));
    }
    // Remove this post from user posts
    yield User.updateOne({ _id: userId }, { $pull: { post: id } });
    // Remove this post from user save list
    yield User.updateMany({ savedPosts: id }, { $pull: { savedPosts: id } });
    // Remove the comment of this post
    yield Comment.deleteMany({ post: id });
    // Remove from cloudinary
    if ((_a = post.image) === null || _a === void 0 ? void 0 : _a.publicId) {
        yield cloudinary.uploader.destroy(post.image.publicId);
    }
    // Remove the post
    yield Post.findByIdAndDelete(id);
    res.status(200).json({
        status: "success",
        message: "Post deleted successfully",
    });
}));
export const likeOrUnlike = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const postId = req.params.postId;
    const post = yield Post.findById(postId);
    if (!post) {
        return next(new AppError("Post not found", 404));
    }
    const isLiked = post.likes.includes(userId);
    let updatedPost;
    if (isLiked) {
        updatedPost = yield Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true });
        return res.status(200).json({
            status: "success",
            message: "Successfully disliked the post",
            data: updatedPost,
        });
    }
    else {
        updatedPost = yield Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true });
        return res.status(200).json({
            status: "success",
            message: "Successfully liked the post",
            data: updatedPost,
        });
    }
}));
export const addComent = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    const userId = req.user._id;
    const user = yield User.findById(userId);
    const { comment } = req.body;
    const post = yield Post.findById(postId);
    if (!post)
        return next(new AppError("Post not found", 404));
    if (!comment)
        return next(new AppError("Comment is required ", 404));
    if (!user)
        return next(new AppError("User not found", 404));
    const newComment = yield Comment.create({
        text: comment,
        user: userId,
        createdAt: Date.now(),
    });
    post.comments.push(newComment._id); //Kemungkinan error
    yield post.save({ validateBeforeSave: false });
    yield newComment.populate({
        path: "user",
        select: "username profilePicture bio",
    });
    return res.status(200).json({
        status: "Success",
        message: "Sucessfully add a comment",
        data: {
            newComment,
        },
    });
}));
export const deleteComment = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const commentId = req.params.commentId;
    const postId = req.params.postId;
    const user = yield User.findById(userId);
    const comment = yield Comment.findById(commentId);
    const post = yield Post.findById(postId);
    if (!user)
        return next(new AppError("User not found", 404));
    if (!comment)
        return next(new AppError("Comment not found", 404));
    if (!post)
        return next(new AppError("Post not found", 404));
    if (user._id.toString() !== comment.user.toString())
        return next(new AppError("You are not authorized to delete this post", 403));
    yield Promise.all([
        Comment.findByIdAndDelete(commentId),
        post.comments.pull(commentId),
        post.save({ validateBeforeSave: false }),
    ]);
    return res.status(200).json({
        status: "Success",
        message: "Successfully deleted comment",
    });
}));
