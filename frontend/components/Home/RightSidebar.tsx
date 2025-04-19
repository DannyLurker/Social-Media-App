"use client";
import { RootState } from "@/store/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { Loader, User2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const RightSidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [suggestedUser, setSuggestedUser] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const getSuggestedUser = async () => {
      const getSuggestedUserReq = async () => {
        return await axios.get(`${BASE_API_URL}/users/suggested-user`, {
          withCredentials: true,
        });
      };

      const result = await handleAuthRequest(getSuggestedUserReq, setIsLoading);

      if (result) {
        setSuggestedUser(result.data.data.users);
      }
    };

    getSuggestedUser();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Avatar
          className={
            user
              ? "w-9 h-9"
              : "w-9 h-9 border-gray-700 border-[2] rounded-full flex justify-center items-center"
          }
        >
          <AvatarImage
            src={`${user?.profilePicture}`}
            className="h-full w-full rounded-full"
          />
          <AvatarFallback>
            <User2Icon />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-bold">{user?.username || "Guest"}</h1>
          <p className="text-gray-700">{user?.bio || ""}</p>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
