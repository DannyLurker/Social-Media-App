import nodemailer from "nodemailer";

type Options = {
  email: string;
  subject: string;
  html: string;
};

export const sendEmail = async (options: Options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL, // Alamat email pengirim
      pass: process.env.EMAIL_PASS, // Password atau token aplikasi Gmail
    },
  });

  const mailOptions = {
    from: `"Nexora", Uniting Moments, Inspiring Connections.`, // Identitas pengirim yang benar
    to: options.email, // Email penerima
    subject: options.subject, // Subjek email
    html: options.html, // Isi pesan dalam format HTML
  };

  await transporter.sendMail(mailOptions);
};
