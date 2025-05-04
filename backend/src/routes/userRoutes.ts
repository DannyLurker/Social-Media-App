import express from "express";
import {
  resendOtp,
  signUp,
  verifyAccount,
  login,
  logout,
  forgetPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  changeUserRole,
  deleteUserAccount,
  editProfile,
  findUser,
  followUnFollow,
  getMe,
  getProfile,
  suggestedUser,
} from "../controllers/userController.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

// Auth Routes
router.post("/signup", signUp);
router.post("/verify", isAuthenticated, verifyAccount);
router.post("/resend-otp", isAuthenticated, resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", isAuthenticated, changePassword);

// User routes
router.get("/profile/:id", getProfile);
router.post(
  "/edit-profile",
  isAuthenticated,
  upload.single("profilePicture"),
  editProfile
);
router.post("/change-role", isAuthenticated, changeUserRole);
router.get("/suggested-user", isAuthenticated, suggestedUser);
router.get("/find-user", findUser);
router.post("/follow-unfollow/:id", isAuthenticated, followUnFollow);
router.get("/me", isAuthenticated, getMe);
router.delete("/delete-account/:id", isAuthenticated, deleteUserAccount);

export default router;
