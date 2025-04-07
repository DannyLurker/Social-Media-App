import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
// 📌 Mengonversi import.meta.url menjadi path sistem file yang valid
const __filename = fileURLToPath(import.meta.url);
// ⬆️ `import.meta.url` mengembalikan URL file dalam format `file://...`
// ⬆️ `fileURLToPath(import.meta.url)` mengubahnya menjadi path absolut seperti `C:\Users\User\myProject\src\utils.ts`
// 📌 Mendapatkan direktori tempat file ini berada
const __dirname = path.dirname(__filename);
// ⬆️ `path.dirname(__filename)` mengambil direktori dari path file
// ⬆️ Jika `__filename` adalah `C:\Users\User\myProject\src\utils.ts`, maka `__dirname` adalah `C:\Users\User\myProject\src`
const app = express();
// Middleware untuk menyajikan file statis dari folder "uploads" pada root URL. File dalam "uploads" dapat diakses melalui URL, misalnya: http://localhost:3000/namafile.jpg
app.use("/", express.static("uploads"));
app.use(cookieParser());
app.use(helmet());
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true,
}));
// Middleware untuk menyajikan file statis dari folder "public" (CSS, gambar, JavaScript, dll.), yang dapat diakses langsung melalui URL, misalnya: http://localhost:3000/style.css
app.use(express.static(path.join(__dirname, "public")));
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
// Routes for users
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
// Route for posts
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
export default app;
