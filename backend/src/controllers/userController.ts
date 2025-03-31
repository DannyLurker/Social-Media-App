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
