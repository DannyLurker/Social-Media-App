import express from "express";
import { createPost, deletePost, getAllPost, getUserPosts, saveOrUnSave, } from "../controllers/postController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../middleware/multer.js";
const router = express.Router();
// Define Routes
router.post("/create-post", isAuthenticated, upload.single("image"), createPost);
router.get("/all", getAllPost);
router.get("/user-post/:id", getUserPosts);
router.post("/save-unsave-post/:postId", isAuthenticated, saveOrUnSave);
router.delete("/delete-post/:id", isAuthenticated, deletePost);
export default router;
