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
import { User } from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import generateOtp from "../utils/generateOtp.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import hbs from "hbs";
import { sendEmail } from "../utils/email.js";
import bcryptjs from "bcryptjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const loadTemplate = (templateName, replacements) => {
    const templatePath = path.join(__dirname, "../emailTemplate", `${templateName}.hbs`);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
    }
    //Work flow (alur kerja)
    // 1.Membaca Template:
    // - Pertama, template mentah dibaca dari file dan disimpan dalam variabel source.
    // 1.Kompilasi Template:
    // - Fungsi hbs.handlebars.compile(source) mengubah teks template (source) menjadi sebuah fungsi render yang dapat dipanggil dengan data.
    // 3.Render Template:
    // - Fungsi render (hasil kompilasi) dipanggil dengan objek replacements.
    // - Placeholder di dalam template akan diganti dengan nilai yang diberikan dalam replacements.
    // 4.Output:
    // - Hasil akhir berupa string dengan semua placeholder telah digantikan oleh data, kemudian dikembalikan sebagai output fungsi.
    //Membaca file, dan disimpan dalam variable source berbentuk plain
    const source = fs.readFileSync(templatePath, "utf-8");
    //Mengubah teks plain pada variable source menjadi fn render
    const template = hbs.handlebars.compile(source);
    //Varible template menjadi fn render yang dapat menerima parameter, untuk mengubah placeholder(yang ditandai dengan {{}}), dengan data yang tersedia.
    return template(replacements);
};
const signToken = (id) => {
    //Gunakan as string pada second parameter pada jwt.sign, jika tidak akan memicu sebuah error no overload matches this call
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "90d",
    });
};
const createSendToken = (user, statusCode, res, message) => {
    //toString disini berguna untuk mengubah ._id yangawalnya merupakan mongoose.Types.ObjectId dari mongoDB menjadi sebuah string (hal ini penting karena signToken yang menerima id berupa string)
    const token = signToken(user._id.toString());
    const cookieOption = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"
            ? "none" //as const disni berguna untuk menginstruksikan TS bahwa nilai merupakan sebuah literal yang spesifik bukan sebagai string biasa. Hal ini penting karena tidak const akan memicu sebuah error message "no overload matches this call". error message disebab kan oleh ketidak sesuain harapan nilai, yang diharapkan adalah sebuah tipe union (yaitu boolean | "none" | "lax" | "strict").
            : "lax", // const memeiliki fungsi sama seperti yang diatas
    };
    res.cookie("token", token, cookieOption);
    user.password = undefined;
    user.otp = undefined;
    res.status(statusCode).json({
        status: "success",
        message,
        token,
        data: {
            user,
        },
    });
};
export const signUp = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, passwordConfirm, username } = req.body;
    const existingUser = yield User.findOne({ email });
    if (existingUser) {
        //kegunaan return disini bukan untuk melakukan pengiriman nilai, melainkan menghentikan program, pengiriman nilai/value error dilakukan oleh next(sebuah fungsi yang digunakan untuk meneruskan permintaan ke middleware berikutnya.)
        return next(new AppError("Email already registered", 400));
    }
    const otp = generateOtp();
    const otpExpires = Date.now() + 24 * 60 * 60 * 1000;
    const newUser = new User({
        username,
        email,
        password,
        passwordConfirm,
        otp,
        otpExpires,
    });
    yield newUser.save();
    const htmlTemplate = loadTemplate("otpTemplate", {
        title: "OTP Verification",
        username: newUser.username,
        otp,
        message: "Your one-time password (OTP) for account verification is: ",
    });
    try {
        yield sendEmail({
            // as string disini untuk mencegah error "Type 'string | null | undefined' is not assignable to type 'string'.  Type 'undefined' is not assignable to type 'string'".
            email: newUser.email,
            subject: "OTP for email verification",
            html: htmlTemplate,
        });
        createSendToken(newUser, 200, res, "Registration Successfull. Check your email for otp verification");
    }
    catch (error) {
        yield User.findByIdAndDelete(newUser._id);
        return next(new AppError("There is an error creating the account. Please try again later", 500));
    }
}));
export const verifyAccount = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    if (!otp) {
        return next(new AppError("OTP is required for verification", 400));
    }
    // menggunakan type assertion (as any) agar TypeScript tidak menampilkan error ketika kita menambahkan properti user ke req.
    //user merupakan sebuah object mongoose makanya user dapat menggunakan properti berupa save
    const user = req.user;
    if (user.otp !== otp) {
        return next(new AppError("Invalid OTP", 400));
    }
    if (Date.now() > user.otpExpires) {
        return next(new AppError("OTP has expired. Please request a new OTP", 400));
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    // Kegunaan dari user.save({ validateBeforeSave: false })
    // Metode ini digunakan untuk menyimpan perubahan pada dokumen Mongoose tanpa menjalankan validasi skema.
    // Pada kondisi sekarang kita hanya ingin mengubah 3 field yaitu (isVerified, otp, otpExpires), jika kita tidak menggunakan validateBeforeSave hal ini akan menyebabkan error karena field lain  yang memiliki properti required kosong.
    yield user.save({ validateBeforeSave: false });
    createSendToken(user, 200, res, "Email has been verified");
}));
export const resendOtp = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.user; // menggunakan type assertion (as any) agar TypeScript tidak menampilkan error ketika kita menambahkan properti user ke req.
    if (!email) {
        return next(new AppError("Email is required", 400));
    }
    const user = yield User.findOne({ email });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    if (user.isVerified) {
        return next(new AppError("This account already verified", 400));
    }
    const otp = generateOtp();
    // new Date diperlukan untuk mengonversi timestamp hasil penjumlahan ke dalam objek Date.
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.otp = otp;
    user.otpExpires = otpExpires;
    yield user.save({ validateBeforeSave: false });
    const htmlTemplate = loadTemplate("otpTemplate", {
        title: "OTP Verification",
        username: user.username,
        otp,
        message: "Your one-time password (OTP) for account verification is: ",
    });
    try {
        yield sendEmail({
            email: user.email,
            subject: "Resend OTP for email verification",
            html: htmlTemplate,
        });
        res.status(200).json({
            status: "Success",
            message: "A new OTP is send to your email",
        });
    }
    catch (error) {
        user.otp = undefined;
        user.otpExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        return next(new AppError("Failed to send OTP email. Please try again later.", 500));
    }
}));
export const login = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }
    const user = yield User.findOne({ email }).select("+password");
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    if (!user.isVerified) {
        return next(new AppError("User has not completed OTP verification", 401));
    }
    const isMatch = yield bcryptjs.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError("Incorrect email or password", 401));
    }
    createSendToken(user, 200, res, "Login Successful");
}));
export const logout = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
        status: "Success",
        message: "Logged out successfully",
    });
}));
export const forgetPassword = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield User.findOne({ email });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    const otp = generateOtp();
    const resetExpires = new Date(Date.now() + 5 * 1000 * 60); //5minutes
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = resetExpires;
    yield user.save({ validateBeforeSave: false });
    const htmlTemplate = loadTemplate("otpTemplate", {
        title: "Reset password OTP",
        username: user.username,
        otp,
        message: "Your password reset otp is ",
    });
    try {
        yield sendEmail({
            email: user.email,
            subject: "Password reset OTP (Avalaible for 5 minutes)",
            html: htmlTemplate,
        });
        res.status(200).json({
            status: "Success",
            message: "Reset password OTP has been sent to your email.",
        });
    }
    catch (error) {
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        return next(new AppError("There was a problem sending the email. Please try again", 500));
    }
}));
export const resetPassword = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, password, passwordConfirm } = req.body;
    if (!(password === passwordConfirm)) {
        return next(new AppError("Password and password confrim must be same", 400));
    }
    const user = yield User.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordOTPExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    yield user.save();
    createSendToken(user, 200, res, "Password reset succefully");
}));
export const changePassword = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.user;
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
        return next(new AppError("All fields must be filled", 400));
    }
    //Tambahkan select("+password") karena password biasanya di-set select: false dalam skema Mongoose.
    const user = yield User.findOne({ email }).select("+password");
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    const isMatch = yield bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
        return next(new AppError("Password is incorrect", 400));
    }
    if (newPassword !== newPasswordConfirm) {
        return next(new AppError("Password must be same", 400));
    }
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    yield user.save({ validateBeforeSave: false });
    createSendToken(user, 200, res, "Password Changed Successfully");
}));
