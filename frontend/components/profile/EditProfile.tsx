"use client";
import PasswordInput from "@/components/Auth/PasswordInput";
import LoadingButton from "@/components/helper/LoadingButton";
import LeftSidebar from "@/components/Home/LeftSidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { handleAuthRequest } from "@/components/utils/apiRequest";
import { BASE_API_URL } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import axios from "axios";
import { MenuIcon, User2Icon } from "lucide-react";
import React, { FormEvent, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const EditProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    user?.profilePicture || null
  );
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isloading, setIsLoading] = useState(false);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("bio", bio);

    formData.append("username", username);
    if (fileInputRef.current?.files?.[0]) {
      formData.append("profilePicture", fileInputRef.current?.files?.[0]);
    }

    const updateProfileReq = async () => {
      return await axios.post(`${BASE_API_URL}/users/edit-profile`, formData, {
        withCredentials: true,
      });
    };
    const result = await handleAuthRequest(updateProfileReq, setIsLoading);

    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    const passwordChangeReq = async () => {
      return await axios.post(
        `${BASE_API_URL}/users/change-password`,
        {
          currentPassword,
          newPassword,
          newPasswordConfirm,
        },
        {
          withCredentials: true,
        }
      );
    };
    const result = await handleAuthRequest(passwordChangeReq, setIsLoading);

    if (result) {
      toast.success(result.data.message);
    }
  };

  return (
    <div className="flex">
      <div className="w-[20%] hidden md:block border-r-2 h-screen fixed">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-[20%] overflow-y-auto">
        <div className="md:hidden ">
          <Sheet>
            <SheetTrigger>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent>
              <SheetTitle></SheetTitle>
              <SheetDescription></SheetDescription>
              <LeftSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div className="w-[80%] mx-auto">
          <div className="mt-16 pb-16 border-b-2">
            <div
              onClick={handleAvatarClick}
              className="flex items-center justify-center cursor-pointer"
            >
              <Avatar
                className={
                  user
                    ? "w-[10rem] h-[10rem] mb-8 md:mb-0"
                    : "w-[10rem] h-[10rem] mb-8 md:mb-0 border-gray-700 border-[2] rounded-full flex justify-center items-center"
                }
              >
                <AvatarImage
                  src={selectedImage || ""}
                  className="h-full w-full rounded-full"
                />
                <AvatarFallback>
                  <User2Icon className="w-[10rem] h-[10rem] mb-8 md:mb-0" />
                </AvatarFallback>
              </Avatar>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              // Properti ref pada elemen input, membuat React secara otomatis mengisi fileInputRef.current
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="flex items-center justify-center ">
              <LoadingButton
                isLoading={isloading}
                size={"lg"}
                className="bg-blue-800 mt-4"
                onClick={handleAvatarClick}
              >
                Change Photo
              </LoadingButton>
            </div>
          </div>
          <div className="mt-10 border-b-2 pb-10">
            <label htmlFor="username" className="block font-bold mb-2 ">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-200 outline-none p-6 rounded-md mb-4"
            />
            <label htmlFor="bio" className="block font-bold mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-[7rem] bg-gray-200 outline-none p-6 rounded-md"
            />
            <LoadingButton
              isLoading={isloading}
              size={"lg"}
              className="mt-6"
              onClick={handleUpdateProfile}
            >
              Update Profile
            </LoadingButton>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mt-6 ">
              Change Password
            </h1>
            <form className="mt-8 mb-8" onSubmit={handlePasswordChange}>
              <div className="w-[90%] md:w-[80%] lg:w-[60%]">
                <PasswordInput
                  name="currentpassword"
                  value={currentPassword}
                  label="Current Password"
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                  }}
                />
              </div>
              <div className="w-[90%] md:w-[80%] lg:w-[60%] mt-4 mb-4">
                <PasswordInput
                  name="newpassword"
                  value={newPassword}
                  label="New Password"
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                  }}
                />
              </div>
              <div className="w-[90%] md:w-[80%] lg:w-[60%] ">
                <PasswordInput
                  name="confirmpassword"
                  value={newPasswordConfirm}
                  label="New Password Confirm"
                  onChange={(e) => {
                    setNewPasswordConfirm(e.target.value);
                  }}
                />
              </div>
              <div className="mt-6">
                <LoadingButton
                  isLoading={isloading}
                  type="submit"
                  className="bg-red-700"
                  onClick={handlePasswordChange}
                >
                  Change Password
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
