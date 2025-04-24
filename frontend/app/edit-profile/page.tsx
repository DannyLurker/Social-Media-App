"use client";
import LoadingButton from "@/components/helper/LoadingButton";
import LeftSidebar from "@/components/Home/LeftSidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { MenuIcon, User2Icon } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const page = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    user?.profilePicture || null
  );
  const [bio, setBio] = useState(user?.bio || "");
  const [currentPassowrd, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfrim, setNewPasswordConfirm] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isloading, setIsLoading] = useState(false);

  const handleAvatarClick = () => {};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {};

  const handleUpdateProfile = async () => {};

  const handlePasswordChange = async () => {};

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
                onClick={handleUpdateProfile}
              >
                Change Photo
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
