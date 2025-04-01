import { upload } from "../models/multer.js";
import { User } from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { getDataUri } from "../utils/datauri.js";

export const getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id })
    .select(
      "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm"
    )
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
});

export const editProfile = catchAsync(async (req, res, next) => {
  const userId = (req as any).user.id;

  const { bio } = req.body;
  const profilePicture = (req as any).file;

  let cloudResponse;

  if (profilePicture) {
    const fileUri = getDataUri(profilePicture);
    cloudResponse = await uploadToCloudinary(fileUri as string);
  }

  const user = await User.findById(userId).select("-password");

  if (!user) return next(new AppError("User not found", 404));

  if (bio) user.bio = bio;
  // Ketika kamu mengunggah gambar ke Cloudinary, respons (cloudResponse) yang dikembalikan biasanya berisi properti secure_url. Properti ini berisi URL gambar yang dapat diakses melalui HTTPS, sehingga aman untuk digunakan di aplikasi.
  if (profilePicture) user.profilePicture = cloudResponse?.secure_url;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    message: "Profile Updated",
    status: "Success",
    data: {
      user,
    },
  });
});

export const suggestedUser = catchAsync(async (req, res, next) => {
  const loginUserId = (req as any).user.id;

  // Mencari semua pengguna yang tidak memiliki _id yang sama dengan loginUserId ($ne berarti "not equal" di MongoDB).
  const users = await User.find({ _id: { $ne: loginUserId } }).select(
    "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm"
  );

  res.status(200).json({
    status: "Success",
    data: {
      users,
    },
  });
});

export const followUnFollow = catchAsync(async (req, res, next) => {
  const loginUserId = (req as any).user.id;
  const targetUserId = req.params.id;

  if (loginUserId.toString() === targetUserId) {
    return next(new AppError("You can't follow/unfollow yourself", 400));
  }

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }

  const isFollowing = targetUser.followers.includes(loginUserId);

  if (isFollowing) {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        // $pull digunakan untuk menghapus elemen tertentu dari array dalam dokumen MongoDB
        { $pull: { following: targetUserId } }
      ),
      User.updateOne(
        {
          _id: targetUser,
        },
        { $pull: { followers: loginUserId } }
      ),
    ]);
  } else {
    await Promise.all([
      User.updateOne(
        {
          _id: loginUserId,
        },
        // $addToSet digunakan untuk menambahkan elemen ke dalam array, tetapi hanya jika elemen tersebut belum ada.
        { $addToSet: { following: targetUserId } }
      ),
      User.updateOne(
        {
          _id: targetUserId,
        },
        { $addToSet: { followers: loginUserId } }
      ),
    ]);
  }

  const updatedLoggedInUser = await User.findById(loginUserId).select(
    "-password"
  );

  res.status(200).json({
    status: "Success",
    message: isFollowing ? "Unfollowed successfully" : "Followed Successfully",
    data: {
      user: updatedLoggedInUser,
    },
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const user = (req as any).user;
  if (!user) return next(new AppError("User not authenticated", 401));

  res.status(200).json({
    status: "Success",
    message: "Authenticated user",
    data: {
      user,
    },
  });
});
