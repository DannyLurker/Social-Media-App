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
import { uploadToCloudinary } from "../utils/cloudinary.js";
export const getProfile = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield User.findById({ _id: id })
        .select("-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm")
        .populate({
        path: "posts", //might be a problem
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
    if (profilePicture)
        user.profilePicture = cloudResponse === null || cloudResponse === void 0 ? void 0 : cloudResponse.secure_url;
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
