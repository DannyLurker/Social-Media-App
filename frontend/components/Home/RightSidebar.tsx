"use client";
import { RootState } from "@/store/store";
import React, { FormEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import {
  ArrowDownUpIcon,
  Loader,
  RefreshCwIcon,
  User2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { warnOptionHasBeenMovedOutOfExperimental } from "next/dist/server/config";

const RightSidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [suggestedUser, setSuggestedUser] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [seeAll, setSeeAll] = useState<boolean>(true);
  const [indexOfSugUser, setIndexOfSugUser] = useState<number[]>([0, 5]);
  const router = useRouter();

  const handleSeeAll = (e: FormEvent) => {
    e.preventDefault();
    setSeeAll(!seeAll);
  };

  const handleRefreshSuggestedUser = (e: FormEvent) => {
    e.preventDefault();

    let [currentStart, currentEnd] = indexOfSugUser;

    const indexZero = (currentStart += 5);
    const indexOne = (currentEnd += 5);

    if (indexZero >= 5 && indexZero > suggestedUser.length - 1) {
      const decreaseIndexZero = (indexOfSugUser[0] -= 5); // kemungkinan error
      const decreaseIndexOne = (indexOfSugUser[1] -= 5); // Kemungkinan error
      setIndexOfSugUser([decreaseIndexZero, decreaseIndexOne]);
      return;
    }

    setIndexOfSugUser([indexZero, indexOne]);
  };

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
    <>
      <div className="flex items-center justify-between mb-8">
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
        <h1 className="font-medium text-blue-700 cursor-pointer">Switch</h1>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex space-x-6">
          <RefreshCwIcon
            className="w-7 h-7 cursor-pointer"
            onClick={handleRefreshSuggestedUser}
          />
          <h1 className="font-semibold text-gray-700">Suggested User</h1>
        </div>
        <div
          onClick={handleSeeAll}
          className="flex space-x-1.5 bg-gray-200 px-1 py-0.5 rounded-md cursor-pointer"
        >
          <ArrowDownUpIcon />
          <h1 className="font-medium">See all</h1>
        </div>
      </div>
      {seeAll &&
        suggestedUser
          ?.slice(indexOfSugUser[0], indexOfSugUser[1])
          .map((s_user) => {
            return (
              <div key={s_user._id} className="mt-6 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 cursor-pointer">
                    <Avatar
                      className={
                        s_user
                          ? "w-9 h-9"
                          : "w-9 h-9 border-gray-700 border-[2] rounded-full flex justify-center items-center"
                      }
                    >
                      <AvatarImage
                        src={`${s_user?.profilePicture}`}
                        className="h-full w-full rounded-full"
                      />
                      <AvatarFallback>
                        <User2Icon />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="font-bold">{s_user?.username}</h1>
                      <p className="text-gray-700">
                        {s_user?.bio || "Nexora User"}
                      </p>
                    </div>
                  </div>
                  <h1
                    className="font-medium text-blue-700 cursor-pointer"
                    onClick={() => {
                      router.push(`/profile/${s_user._id}`);
                    }}
                  >
                    Details
                  </h1>
                </div>
              </div>
            );
          })}
    </>
  );
};

export default RightSidebar;
