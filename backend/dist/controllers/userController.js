var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";
export const getProfile = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield User.findById({ _id: id })
        .select("-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm")
        .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
    })
        .populate({
        path: "savedPosts",
        options: { sort: { createdAt: -1 } },
    });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({
        status: "Success",
        data: {
            user,
        },
    });
}));
export const editProfile = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = req.user.id;
    const { bio, username } = req.body;
    const profilePicture = req.file;
    let cloudResponse;
    if (profilePicture) {
        cloudResponse = yield uploadToCloudinary(profilePicture.buffer);
    }
    const user = yield User.findById(userId).select("-password");
    if (!user)
        return next(new AppError("User not found", 404));
    if (username) {
        user.username = username;
    }
    else {
        return next(new AppError("Username must be filled", 401));
    }
    if (bio)
        user.bio = bio;
    // Ketika kamu mengunggah gambar ke Cloudinary, respons (cloudResponse) yang dikembalikan biasanya berisi properti secure_url. Properti ini berisi URL gambar yang dapat diakses melalui HTTPS, sehingga aman untuk digunakan di aplikasi.
    // Diperlukan if statement dengan berbagai pengecekan untuk menghindari error dari TS seperti string tidak sama dengan undefined
    if (profilePicture && user.profilePicture && (cloudResponse === null || cloudResponse === void 0 ? void 0 : cloudResponse.secure_url)) {
        user.profilePicture = {
            url: cloudResponse.secure_url,
            publicId: cloudResponse.public_id,
        };
    }
    console.log((_a = user.profilePicture) === null || _a === void 0 ? void 0 : _a.url);
    console.log((_b = user.profilePicture) === null || _b === void 0 ? void 0 : _b.publicId);
    yield user.save({ validateBeforeSave: false });
    return res.status(200).json({
        message: "Profile Updated",
        status: "Success",
        data: {
            user,
        },
    });
}));
export const suggestedUser = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loginUserId = req.user.id;
    // Mencari semua pengguna yang tidak memiliki _id yang sama dengan loginUserId ($ne berarti "not equal" di MongoDB).
    const users = yield User.find({ _id: { $ne: loginUserId } }).select("-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm");
    res.status(200).json({
        status: "Success",
        data: {
            users,
        },
    });
}));
export const changeUserRole = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { targettedUserId } = req.body;
    const userAccount = yield User.findOne({ _id: userId });
    const targettedUserAccount = yield User.findOne({ _id: targettedUserId });
    if (!userAccount) {
        return next(new AppError("User not found", 404));
    }
    if (!targettedUserAccount) {
        return next(new AppError("User not found", 404));
    }
    if ((userAccount === null || userAccount === void 0 ? void 0 : userAccount.role) !== "admin" && (userAccount === null || userAccount === void 0 ? void 0 : userAccount.role) !== "owner") {
        return next(new AppError("You are not authorized to change user role", 403));
    }
    if ((userAccount === null || userAccount === void 0 ? void 0 : userAccount.role) === "admin" && (targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount.role) === "owner") {
        return next(new AppError("You are not authorized to change owner role", 403));
    }
    if (targettedUserAccount.role === "user") {
        targettedUserAccount.role = "admin";
        targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount.save({ validateBeforeSave: false });
    }
    else {
        targettedUserAccount.role = "user";
        targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount.save({ validateBeforeSave: false });
    }
    res.status(200).json({
        status: "Success",
        message: "Succesfully change user role",
    });
}));
export const findUser = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = req.query;
    if (!search) {
        return res.status(200).json({
            status: "Success",
            data: { users: [] },
        });
    }
    const users = yield User.find({
        username: { $regex: search, $options: "i" },
    }).select("-password");
    res.status(200).json({
        status: "Success",
        message: "successfully search",
        data: { users },
    });
}));
export const followUnFollow = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loginUserId = req.user.id;
    const targetUserId = req.params.id;
    if (loginUserId.toString() === targetUserId) {
        return next(new AppError("You can't follow/unfollow yourself", 400));
    }
    const targetUser = yield User.findById(targetUserId);
    if (!targetUser) {
        return next(new AppError("User not found", 404));
    }
    const isFollowing = targetUser.followers.includes(loginUserId);
    if (isFollowing) {
        yield Promise.all([
            User.updateOne({ _id: loginUserId }, 
            // $pull digunakan untuk menghapus elemen tertentu dari array dalam dokumen MongoDB
            { $pull: { following: targetUserId } }),
            User.updateOne({
                _id: targetUser,
            }, { $pull: { followers: loginUserId } }),
        ]);
    }
    else {
        yield Promise.all([
            User.updateOne({
                _id: loginUserId,
            }, 
            // $addToSet digunakan untuk menambahkan elemen ke dalam array, tetapi hanya jika elemen tersebut belum ada.
            { $addToSet: { following: targetUserId } }),
            User.updateOne({
                _id: targetUserId,
            }, { $addToSet: { followers: loginUserId } }),
        ]);
    }
    const updatedLoggedInUser = yield User.findById(loginUserId).select("-password");
    res.status(200).json({
        status: "Success",
        message: isFollowing ? "Unfollowed successfully" : "Followed Successfully",
        data: {
            user: updatedLoggedInUser,
        },
    });
}));
export const getMe = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user)
        return next(new AppError("User not authenticated", 401));
    res.status(200).json({
        status: "Success",
        message: "Authenticated user",
        data: {
            user,
        },
    });
}));
export const deleteUserAccount = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.user._id;
    const targettedUserId = req.params.id;
    const userAccount = yield User.findOne({ _id: userId });
    const targettedUserAccount = yield User.findOne({ _id: targettedUserId });
    if (!userAccount && !targettedUserAccount) {
        return next(new AppError("User not found", 404));
    }
    if ((userAccount === null || userAccount === void 0 ? void 0 : userAccount.role) !== "admin" && (userAccount === null || userAccount === void 0 ? void 0 : userAccount.role) !== "owner") {
        return next(new AppError("You're not authorized to delete others account", 403));
    }
    const userPost = yield Post.find({ user: targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount._id });
    const userPostIds = userPost.map((userPost) => userPost === null || userPost === void 0 ? void 0 : userPost._id);
    yield User.updateMany({}, {
        $pull: {
            followers: targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount._id,
            following: targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount._id,
            savedPosts: { $in: userPostIds },
        },
    });
    // Kenapa pada pull likes tidak perlu dibuat kedalam array seperti userCommentIds ? Karena pada likes, user hanya bisa memberikan satu like pada setiap postingan, jadi idnya hanya akan ada satu, berbeda dengan comment yang dapat di berikan secara banyak, maka akan ada lebih dari satu id yang jadi perlu dilakukan .find terlebih dahulu baru di map, dan terakhir dilakukan ini { $in: userCommentIds }
    const userComments = yield Comment.find({ user: targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount._id });
    const userCommentIds = userComments.map((c) => c._id);
    yield Post.updateMany({}, {
        $pull: {
            likes: targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount._id,
            comments: { $in: userCommentIds },
        },
    });
    // Kenapa menggunakan flatMap ? jika menggunakan map dengan code seperti ini
    // const ids = userPost.map(post => post.comments.map(c => c._id));
    // akan menghasilkan hasil seperti ini :
    //    [
    //   [id1, id2],   // dari post 1
    //   [id3],        // dari post 2
    //   [id4, id5, id6], // dari post 3
    //   ...
    // ]
    //Jika menggunakan flatMap, dengan code seperti ini :
    // const ids = userPost.flatMap(post => post.comments.map(c => c._id));
    // Hasilnya akan seperti ini :
    // [id1, id2, id3, id4, id5, id6, ...]
    const userPostCommentsIds = userPost.flatMap((userPost) => Array.isArray(userPost === null || userPost === void 0 ? void 0 : userPost.comments)
        ? userPost.comments.map((comment) => comment === null || comment === void 0 ? void 0 : comment._id)
        : []);
    yield Comment.deleteMany({
        user: targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount._id,
    });
    yield Comment.deleteMany({
        _id: { $in: userPostCommentsIds },
    });
    const userPosts = yield Post.find({ user: targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount._id });
    console.log(userPosts);
    for (const post of userPosts) {
        if ((_a = post.image) === null || _a === void 0 ? void 0 : _a.publicId) {
            try {
                yield cloudinary.uploader.destroy(post.image.publicId);
            }
            catch (err) {
                console.error("Failed to delete image from Cloudinary:", err);
            }
        }
    }
    yield Post.deleteMany({ user: targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount._id });
    if ((targettedUserAccount === null || targettedUserAccount === void 0 ? void 0 : targettedUserAccount.profilePicture) &&
        typeof targettedUserAccount.profilePicture.publicId === "string") {
        try {
            yield cloudinary.uploader.destroy(targettedUserAccount.profilePicture.publicId);
        }
        catch (err) {
            console.error("Failed to delete image from Cloudinary:", err);
        }
    }
    yield User.findByIdAndDelete(targettedUserId, { $new: true });
    res.status(200).json({
        status: "success",
        message: "Succesfully deleted user",
    });
}));
