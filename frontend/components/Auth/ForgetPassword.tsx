"use client";
import { KeySquareIcon } from "lucide-react";
import React, { FormEvent } from "react";
import LoadingButton from "../helper/LoadingButton";
import { useState } from "react";
import { BASE_API_URL } from "@/server";
import axios from "axios";
import { handleAuthRequest } from "../utils/apiRequest";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setAuthUser } from "@/store/authSlice";
import { toast } from "sonner";

const ForgetPassword = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const forgetPasswordReq = async () => {
      return await axios.post(
        `${BASE_API_URL}/users/forget-password`,
        { email },
        { withCredentials: true }
      );
    };

    const result = await handleAuthRequest(forgetPasswordReq, setIsLoading);

    if (result) {
      toast.success(result.data.message);

      router.push("/"); // It should be goes to the rest password route
    }
  };

  return (
    <div className="w-full h-screen flex items-center flex-col justify-center">
      <KeySquareIcon className="w-20 h-20 sm:w-32 sm:h-32 text-red-600 mb-12" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">
        Forget Your Password?
      </h1>
      <p className="mb-6 text-sm sm:text-base text-center text-gray-600 font-medium">
        Enter your email and we will help you to reset your password
      </p>
      <input
        type="email"
        placeholder="Enter Your Email"
        className="px-6 py-3.5 rounded-lg outline-none bg-gray-200 block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] mx-auto "
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <LoadingButton
        className="w-40 mt-4"
        size={"lg"}
        isLoading={isLoading}
        onClick={handleSubmit}
      >
        Continue
      </LoadingButton>
    </div>
  );
};

export default ForgetPassword;
