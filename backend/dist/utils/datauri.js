// datauri tidak terpakai karena saya menggunakan sistem buffer pada seluruh image yang akan di simpan pada DB
import DataUriParser from "datauri/parser.js";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// tipe Express.Multer.File menyimpan data yang berkaitan dengan file
export const getDataUri = (file) => {
    const parser = new DataUriParser();
    // Mengambil ekstensi file dari properti 'originalname' (misalnya: '.jpg', '.png')
    const extName = path.extname(file.originalname).toString();
    // Mengonversi buffer file menjadi format Data URI
    // Fungsi 'format' dari DataUriParser mengembalikan objek yang memiliki properti 'content'
    // 'content' ini berisi string Data URI (misalnya: "data:image/png;base64,....")
    return parser.format(extName, file.buffer).content;
};
