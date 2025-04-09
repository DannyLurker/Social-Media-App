"use client";
import React, { useState } from "react";
import Image from "next/image";
import PasswordInput from "./PasswordInput";
import LoadingButton from "../helper/LoadingButton";
import Link from "next/link";

// Kegunaan grid cols pada project ini untuk breakpoint (responsive), jadi ketika berada di breakpoint dibawah lg hanya hanya akan menampilkan 1 column(vertikal), jika diatas menampilkan 7 column, lalu kegunaan col span itu seperti menentukan berapa column yang akan di gunakan pada breakpoint dibawah lg, col span pada banner akan hilang(hidden) jadi nya hanya menampilkan form, dan jika diatas breakpoint lg, banner akan menggunakan 4 column lalu form akan menggunakan 3 column

const Login = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
          <form className="block w-[90%] sm:w-[80%] md:w-[90%] lg:w-[90%] xl:w-[80%]">
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
              />
            </div>
            <div className="mb-4">
              <PasswordInput
                label="Password"
                name="password"
                placeholder="Enter password"
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
          <p className="mt-4 text-lg text-gray-800 text-center">
            Already have an account ?{" "}
            <Link href={"/auth/signup"}>
              <span className="text-blue-500 hover:text-blue-600 underline cursor-pointer font-bold">
                Create an account
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
