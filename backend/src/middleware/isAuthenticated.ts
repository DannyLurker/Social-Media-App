import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { User } from "../models/userModel.js";

export const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to access", 401)
    );
  }

  //as string disini penting untuk menghindari error, dan meyakini TS bahwa JWT_SECRET adalah string
  //Gunakan as JwtPayload untuk memberi tahu TypeScript bahwa hasil jwt.verify() adalah objek dengan properti id
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as jwt.JwtPayload;

  //id berasal dari jwt.sign yang ada di authCotroller
  const currentUser = await User.findById(decoded.id as string);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does not exist", 401)
    );
  }

  // menggunakan type assertion (as any) agar TypeScript tidak menampilkan error ketika kita menambahkan properti user ke req.
  (req as any).user = currentUser;
  next();
});
