var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { User } from "../models/userModel.js";
export const isAuthenticated = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = req.cookies.token || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
    if (!token) {
        return next(new AppError("You are not logged in! Please log in to access", 401));
    }
    //as string disini penting untuk menghindari error, dan meyakini TS bahwa JWT_SECRET adalah string
    //Gunakan as JwtPayload untuk memberi tahu TypeScript bahwa hasil jwt.verify() adalah objek dengan properti id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //id berasal dari jwt.sign yang ada di authCotroller
    const currentUser = yield User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The user belonging to this token does not exist", 401));
    }
    // menggunakan type assertion (as any) agar TypeScript tidak menampilkan error ketika kita menambahkan properti user ke req.
    req.user = currentUser;
    next();
}));
