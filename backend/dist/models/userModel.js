var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add username"],
        unique: true, //username menjadi unik, hanya 1
        trim: true, //removes whitespace characters, including the null character,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username maximum 30 characters"],
        index: true,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        minlength: [8, "Username must be at least 8 characters"],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Password are not the same",
        },
    },
    profilePicture: {
        type: String,
    },
    bio: {
        type: String,
        maxlength: 150,
        default: "",
    },
    // Menggunakan array karena user bisa saja diikuti oleh lebih dari satu user
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    savedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null,
        required: false, //perlu untuk menghindari error message dari TS
    },
    otpExpires: {
        type: Date,
        default: null,
        required: false, //perlu untuk menghindari error message dari TS
    },
    resetPasswordOTP: {
        type: String,
        default: null,
        required: false, //perlu untuk menghindari error message dari TS
    },
    resetPasswordOTPExpires: {
        type: Date,
        default: null,
        required: false, //perlu untuk menghindari error message dari TS
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
}, {
    timestamps: true,
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        //method isModified adalah sebuah method yang digunakan untuk melakukan pengecekan pada sebuah field apakah sudah diubah atau belum jika sebuah field telah diubah(berubah) maka method isModified akan mengembalikan nilai true jika belum mengembalikan nilai false
        //Ketika membuat sebuah data baru dengan method create ataupun save, maka data tersebut(pada semua field) dianggap sudah berubah
        // Alur kerja nya seperti ini:
        // Data baru dibuat -> data tersebut dianggap sebagai data yang diubah dan mengembalikan nilai true -> dikarena operator isNot membuat nilai yang dikembalikan yang tadinya true menjadi false yang membuat return next() di abaikan -> setelah return next() diabaikan akan dilanjutkan dengan hashing yang dilakukan dengan bcryptjs dan passwordConfrim yang diubah menjadi undefined -> setelah serangkain operasi selesai fn next() akan dipanggil untuk melanjutkan operasi selanjutnya yaitu menyimpan kedalam DB. next() wajib di panggil agar proses tidak terhenti.
        if (!this.isModified("password"))
            return next();
        this.password = yield bcryptjs.hash(this.password, 12);
        this.passwordConfirm = undefined;
        next();
    });
});
export const User = mongoose.model("User", userSchema);
