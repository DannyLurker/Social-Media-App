import express from "express";
import { addComent, createPost, deleteComment, deletePost, getAllPost, getUserPosts, likeOrUnlike, saveOrUnsave, } from "../controllers/postController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../middleware/multer.js";
const router = express.Router();
// Define Routes
router.post("/create-post", isAuthenticated, upload.single("image"), createPost);
router.get("/all", getAllPost);
router.get("/user-post/:id", getUserPosts);
router.post("/save-unsave-post/:postId", isAuthenticated, saveOrUnsave);
router.delete("/delete-post/:id", isAuthenticated, deletePost);
router.post("/like-unlike-post/:postId", isAuthenticated, likeOrUnlike);
router.post("/add-comment/:postId", isAuthenticated, addComent);
router.delete("/delete-comment/:postId/:commentId", isAuthenticated, deleteComment);
export default router;
