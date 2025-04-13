"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import PasswordInput from "./PasswordInput";
import LoadingButton from "../helper/LoadingButton";
import Link from "next/link";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";

// Kegunaan grid cols pada project ini untuk breakpoint (responsive), jadi ketika berada di breakpoint dibawah lg hanya hanya akan menampilkan 1 column(vertikal), jika diatas menampilkan 7 column, lalu kegunaan col span itu seperti menentukan berapa column yang akan di gunakan pada breakpoint dibawah lg, col span pada banner akan hilang(hidden) jadi nya hanya menampilkan form, dan jika diatas breakpoint lg, banner akan menggunakan 4 column lalu form akan menggunakan 3 column

// Kegunaan atribute name pada element input berfungsi untuk mempermudah dalam menyeleksi element input mana yang sedang aktif / sedang di ketik oleh user jadinya data yang user ketikan dapat disimpan dengan benar.

interface FormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const Signup = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const signupReq = async () =>
      await axios.post(`${BASE_API_URL}/users/signup`, formData, {
        withCredentials: true,
      });

    const result = await handleAuthRequest(signupReq, setIsLoading);

    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);

      router.push("/"); // It should be redirect to Email Verification page
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Banner */}
        <div className="lg:col-span-4 h-screen hidden lg:block">
          <Image
            src={"/images/banner.jpg"}
            alt="singup"
            width={1000}
            height={1000}
            className="w-full h-full object-cover"
          />
        </div>
        {/* form */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center h-screen">
          <h1 className="font-bold text-xl sm:text-2xl text-left uppercase mb-8">
            Sign Up with <span className="text-blue-400">Nexora</span>
          </h1>
          <form
            onSubmit={handleSubmit}
            className="block w-[90%] sm:w-[80%] md:w-[90%] lg:w-[90%] xl:w-[80%]"
          >
            <div className="mb-4">
              <label htmlFor="name" className="font-semibold mb-2 block">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="name"
                placeholder="Username"
                className="px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="font-semibold mb-2 block">
                Email
              </label>
              <input
                type="text"
                name="email"
                id="email"
                placeholder="Email address"
                className="px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <PasswordInput
                label="Password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <PasswordInput
                label="Password Confirm"
                name="passwordConfirm"
                placeholder="Enter password confirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
              />
            </div>
            <LoadingButton
              size={"lg"}
              className="w-full mt-3"
              type="submit"
              isLoading={isLoading}
            >
              Sign Up Now
            </LoadingButton>
          </form>
          <p className="mt-4 text-lg text-gray-800">
            have an account ?{" "}
            <Link href={"/auth/login"}>
              <span className="text-blue-500 hover:text-blue-600 underline cursor-pointer font-bold">
                Login Here
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
