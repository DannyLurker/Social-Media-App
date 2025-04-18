var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from "nodemailer";
export const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL, // Alamat email pengirim
            pass: process.env.EMAIL_PASS, // Password atau token aplikasi Gmail
        },
    });
    const mailOptions = {
        from: `"Nexora", Where Connections Begin.`, // Identitas pengirim yang benar
        to: options.email, // Email penerima
        subject: options.subject, // Subjek email
        html: options.html, // Isi pesan dalam format HTML
    };
    yield transporter.sendMail(mailOptions);
});
