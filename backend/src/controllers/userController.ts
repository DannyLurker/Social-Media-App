import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";

export const getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id })
    .select(
      "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm"
    )
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
});

export const editProfile = catchAsync(async (req, res, next) => {
  const userId = (req as any).user.id;

  const { bio, username } = req.body;
  const profilePicture = req.file;

  let cloudResponse;

  if (profilePicture) {
    cloudResponse = await uploadToCloudinary(profilePicture.buffer);
  }

  const user = await User.findById(userId).select("-password");

  if (!user) return next(new AppError("User not found", 404));

  if (username) {
    user.username = username;
  } else {
    return next(new AppError("Username must be filled", 401));
  }
  if (bio) user.bio = bio;
  // Ketika kamu mengunggah gambar ke Cloudinary, respons (cloudResponse) yang dikembalikan biasanya berisi properti secure_url. Properti ini berisi URL gambar yang dapat diakses melalui HTTPS, sehingga aman untuk digunakan di aplikasi.

  // Diperlukan if statement dengan berbagai pengecekan untuk menghindari error dari TS seperti string tidak sama dengan undefined
  if (profilePicture && user.profilePicture && cloudResponse?.secure_url) {
    user.profilePicture = {
      url: cloudResponse.secure_url,
      publicId: cloudResponse.public_id,
    };
  }

  console.log(user.profilePicture?.url);
  console.log(user.profilePicture?.publicId);

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

export const changeUserRole = catchAsync(async (req, res, next) => {
  const userId = (req as any).user.id;
  const { targettedUserId } = req.body;
  const userAccount = await User.findOne({ _id: userId });
  const targettedUserAccount = await User.findOne({ _id: targettedUserId });

  if (!userAccount) {
    return next(new AppError("User not found", 404));
  }

  if (!targettedUserAccount) {
    return next(new AppError("User not found", 404));
  }

  if (userAccount?.role !== "admin" && userAccount?.role !== "owner") {
    return next(
      new AppError("You are not authorized to change user role", 403)
    );
  }

  if (userAccount?.role === "admin" && targettedUserAccount?.role === "owner") {
    return next(
      new AppError("You are not authorized to change owner role", 403)
    );
  }

  if (targettedUserAccount.role === "user") {
    targettedUserAccount.role = "admin";
    targettedUserAccount?.save({ validateBeforeSave: false });
  } else {
    targettedUserAccount.role = "user";
    targettedUserAccount?.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: "Success",
    message: "Succesfully change user role",
  });
});

export const findUser = catchAsync(async (req, res, next) => {
  const { search } = req.query;

  if (!search) {
    return res.status(200).json({
      status: "Success",
      data: { users: [] },
    });
  }

  const users = await User.find({
    username: { $regex: search, $options: "i" },
  }).select("-password");

  res.status(200).json({
    status: "Success",
    message: "successfully search",
    data: { users },
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

export const deleteUserAccount = catchAsync(async (req, res, next) => {
  const userId = (req as any).user._id;
  const targettedUserId = req.params.id;

  const userAccount = await User.findOne({ _id: userId });
  const targettedUserAccount = await User.findOne({ _id: targettedUserId });

  if (!userAccount && !targettedUserAccount) {
    return next(new AppError("User not found", 404));
  }

  if (userAccount?.role !== "admin" && userAccount?.role !== "owner") {
    return next(
      new AppError("You're not authorized to delete others account", 403)
    );
  }

  const userPost = await Post.find({ user: targettedUserAccount?._id });
  const userPostIds = userPost.map((userPost) => userPost?._id);

  await User.updateMany(
    {},
    {
      $pull: {
        followers: targettedUserAccount?._id,
        following: targettedUserAccount?._id,
        savedPosts: { $in: userPostIds },
      },
    }
  );

  // Kenapa pada pull likes tidak perlu dibuat kedalam array seperti userCommentIds ? Karena pada likes, user hanya bisa memberikan satu like pada setiap postingan, jadi idnya hanya akan ada satu, berbeda dengan comment yang dapat di berikan secara banyak, maka akan ada lebih dari satu id yang jadi perlu dilakukan .find terlebih dahulu baru di map, dan terakhir dilakukan ini { $in: userCommentIds }

  const userComments = await Comment.find({ user: targettedUserAccount?._id });
  const userCommentIds = userComments.map((c) => c._id);

  await Post.updateMany(
    {},
    {
      $pull: {
        likes: targettedUserAccount?._id,
        comments: { $in: userCommentIds },
      },
    }
  );

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

  const userPostCommentsIds = userPost.flatMap((userPost) =>
    Array.isArray(userPost?.comments)
      ? userPost.comments.map((comment: any) => comment?._id)
      : []
  );

  await Comment.deleteMany({
    user: targettedUserAccount?._id,
  });

  await Comment.deleteMany({
    _id: { $in: userPostCommentsIds },
  });

  const userPosts = await Post.find({ user: targettedUserAccount?._id });

  for (const post of userPosts) {
    if (post.image?.publicId) {
      try {
        await cloudinary.uploader.destroy(post.image.publicId);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }
  }

  await Post.deleteMany({ user: targettedUserAccount?._id });

  if (
    targettedUserAccount?.profilePicture &&
    typeof targettedUserAccount.profilePicture.publicId === "string"
  ) {
    try {
      await cloudinary.uploader.destroy(
        targettedUserAccount.profilePicture.publicId
      );
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
    }
  }

  await User.findByIdAndDelete(targettedUserId, { $new: true });

  res.status(200).json({
    status: "success",
    message: "Succesfully deleted user",
  });
});
