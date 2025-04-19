"use client";
import { Loader, MailCheck } from "lucide-react";
import React, {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import LoadingButton from "../helper/LoadingButton";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { RootState } from "@/store/store";

const Verify = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state?.auth.user);
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
    } else if (user && user.isVerified) {
      router.replace("/");
    } else {
      setIsPageLoading(false);
    }
  }, [user, router]);

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = event.target;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
    }

    if (value.length === 1 && inputRefs.current[index + 1]?.focus()) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ): void => {
    if (
      event.key === "Backspace" &&
      !inputRefs.current[index]?.value &&
      inputRefs.current[index - 1]?.focus()
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    const verifyReq = async () =>
      await axios.post(
        `${BASE_API_URL}/users/verify`,
        { otp: otpValue },
        {
          withCredentials: true,
        }
      );

    const result = await handleAuthRequest(verifyReq, setLoadingState);

    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);

      router.push("/");
    }
  };

  const handleResendOTP = async (e: FormEvent) => {
    e.preventDefault();

    const ResendOTPReq = async () =>
      await axios.post(
        `${BASE_API_URL}/users/resend-otp`,
        {},
        { withCredentials: true }
      );

    const result = await handleAuthRequest(ResendOTPReq, setLoadingState);

    console.log(result);

    if (result) {
      dispatch(setAuthUser(result.data.user));
      toast.success(result.data.message);
    }
  };

  if (isPageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="w-20 h-20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center flex-col justify-center">
      <MailCheck className="w-20 h-20 sm:w-32 sm:h-32 text-red-600 mb-12" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">OTP Verification</h1>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-medium">
        We have sent a code to {user?.email}
      </p>
      <div className="flex space-x-4">
        {[0, 1, 2, 3, 4, 5].map((index) => {
          return (
            <input
              type="number"
              key={index}
              maxLength={1}
              className="w-10 h-10 sm:w-20 sm:h-20 rounded-lg bg-gray-200 text-lg sm:text-3xl font-bold outline-gray-500 text-center"
              value={otp[index] || ""}
              ref={(el) => {
                // el berguna untuk mendapatkan informasi dari element yang sedang active
                inputRefs.current[index] = el;
              }}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onChange={(e) => handleChange(index, e)}
            />
          );
        })}
      </div>
      <div className="flex items-center mt-4 space-x-2">
        <h1 className="text-sm sm:text-lg font-medium text-gary-700">
          Didn&apos;t get the OTP code ?{" "}
        </h1>
        <button
          onClick={handleResendOTP}
          className="text-sm sm:text-lg font-medium text-blue-900 underline cursor-pointer"
        >
          Resend Code
        </button>
      </div>
      <LoadingButton
        onClick={handleSubmit}
        size={"lg"}
        className="mt-6 w-32 cursor-pointer"
        isLoading={loadingState}
      >
        Verify
      </LoadingButton>
    </div>
  );
};

export default Verify;
