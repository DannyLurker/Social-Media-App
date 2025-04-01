import express from "express";
import { createPost } from "../controllers/postController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../middleware/multer.js";
const router = express.Router();
// Define Routes
router.post("/create-post", isAuthenticated, upload.single("image"), createPost);
export default router;
