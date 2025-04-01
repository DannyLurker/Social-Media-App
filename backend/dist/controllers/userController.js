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
import { getDataUri } from "../utils/datauri.js";
export const getProfile = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield User.findById({ _id: id })
        .select("-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm")
        .populate({
        path: "post", //might be a problem
        options: { sort: { createdAt: -1 } },
    })
        .populate({
        path: "savePosts",
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
    const { bio } = req.body;
    const profilePicture = req.file;
    let cloudResponse;
    if (profilePicture) {
        const fileUri = getDataUri(profilePicture);
        cloudResponse = yield uploadToCloudinary(fileUri);
    }
    const user = yield User.findById(userId).select("-password");
    if (!user)
        return next(new AppError("User not found", 404));
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
