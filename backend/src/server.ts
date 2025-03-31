import dotenv from "dotenv";
import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down");
  //err.name dan err.message properti bawaan dari objek Error di JavaScript
  console.log(err.name, err.message);
  process.exit(1);
});

import app from "./app.js";

dotenv.config();

mongoose
  .connect(process.env.DB as string)
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((err: unknown) => {
    // Lebih aman menggunakan unknown daripada object
    if (err instanceof Error) {
      // Mengecek apakah err adalah instance dari Error
      console.log(`Error: ${err.message}`);
    } else {
      console.log("An unknown error occurred:", err);
    }
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.log("UNHANDLED REJECTION! Shutting down");
  if (reason instanceof Error) {
    console.log(reason.name, reason.message);
  } else {
    console.log("Unhandled rejection reason:", reason);
  }
});
