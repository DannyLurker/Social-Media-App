import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Comments text is required"],
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
export const Comment = mongoose.model("Comment", commentSchema);
