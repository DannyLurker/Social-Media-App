import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        maxlength: [2200, "Caption should be less then 2200 characters"],
        trim: true,
    },
    image: {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User id is required"],
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    createdAt: {
        type: String,
        default: Date.now(),
    },
}, { timestamps: true });
// Index digunakan untuk meningkatkan kecepatan pencarian query dengan cara menyusun data secara lebih optimal.
// user: 1 → Mengurutkan berdasarkan user secara ascending (A-Z).
// createdAt: -1 → Mengurutkan berdasarkan createdAt descending (terbaru dulu).
postSchema.index({ user: 1, createdAt: -1 });
export const Post = mongoose.model("Post", postSchema);
