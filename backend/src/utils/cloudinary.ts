import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";
dotenv.config();

// Definisikan tipe hasil upload
interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  [key: string]: any; // untuk mengizinkan property lain dari cloudinary
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

export const uploadToCloudinary = async (
  buffer: Buffer
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    // Membuat instance ReadAble();
    const readable = new Readable();

    // meng-override fungsi _read karena kita tidak perlu membaca dari sumber eksternal secara kontinu.
    readable._read = () => {};

    // Melalakukan push pada data buffer
    readable.push(buffer);

    // readable.push(null) dipanggil untuk menandakan akhir dari stream (EOF).
    readable.push(null);

    //upload_stream(...) dipanggil, fungsi ini membuat koneksi ke Cloudinary dan menunggu data masuk melalui stream.
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "posts" },
      // Callback akan di panggil ketika semua data dari stream telah berhasil di-upload dan diproses, jadi ketika data berhasil di alirkan, diupload dan diproses maka data seperti secure_url dan public_id
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result as CloudinaryUploadResult); // tambahkan casting di sini
      }
    );

    // Pipe data dari readable distream ke upload stream Cloudinary
    // readable(berisi buffer) mengalirkan data nya menuju uploadStream
    readable.pipe(uploadStream);
  });
};

export { cloudinary };
