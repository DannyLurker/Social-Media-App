"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import { User } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { Grid, Loader, User2Icon, Bookmark } from "lucide-react";
import LeftSidebar from "../Home/LeftSidebar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { MenuIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Post from "./Post";
import Save from "./Save";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";

type Props = {
  id: string;
};

const Profile = ({ id }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [postOrSave, setPostOrSave] = useState<"POST" | "SAVE">("POST");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<User>();

  const isOwnProfile = user?._id === id;
  const isFollowing = user?.following.includes(id);

  const handleFollowUnfollow = async (e: FormEvent) => {
    e.preventDefault();
    const handleFollowUnfollowReq = async () => {
      return await axios.post(
        `${BASE_API_URL}/users/follow-unfollow/${id}`,
        {},
        { withCredentials: true }
      );
    };

    const result = await handleAuthRequest(
      handleFollowUnfollowReq,
      setIsLoading
    );

    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(`Successfully Follow ${userProfile?.username}`);
    }
  };

  useEffect(() => {
    if (!user) {
      return router.push("/auth/login");
    }

    const getUser = async () => {
      const getUserReq = async () => {
        return await axios.get(`${BASE_API_URL}/users/profile/${id}`);
      };

      const result = await handleAuthRequest(getUserReq, setIsLoading);

      if (result) {
        setUserProfile(result.data.data.user);
      }
    };

    getUser();
  }, [user, router, id]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col ">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex mb-20">
        <div className="w-[20%] hidden md:block border-r-2 h-screen fixed">
          <LeftSidebar />
        </div>
        <div className="flex-1 md:ml-[30%] overflow-y-auto">
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
          <div className="w-[90%] sm:w-[80%] mx-auto">
            {/* Top Profile */}
            <div className="mt-16 flex md:flex-row flex-col md:items-center pb-16 border-b-2 md:space-x-20  ">
              <Avatar
                className={
                  userProfile
                    ? "w-[10rem] h-[10rem] mb-8 md:mb-0"
                    : "w-[10rem] h-[10rem] mb-8 md:mb-0 border-gray-700 border-[2] rounded-full flex justify-center items-center"
                }
              >
                <AvatarImage
                  src={`${userProfile?.profilePicture}`}
                  className="h-full w-full rounded-full"
                />
                <AvatarFallback>
                  <User2Icon className="w-[10rem] h-[10rem] mb-8 md:mb-0" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-8">
                  <h1 className="text-2xl font-bold">
                    {userProfile?.username}
                  </h1>
                  {isOwnProfile && (
                    <Link href={"/edit-profile"}>
                      <Button variant={"secondary"} className="cursor-pointer">
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                  {!isOwnProfile && (
                    <Button
                      variant={isFollowing ? "destructive" : "secondary"}
                      className="cursor-pointer"
                      onClick={handleFollowUnfollow}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-8 mt-6 mb-6">
                  <div>
                    <span className="font-bold">
                      {userProfile?.posts.length}
                    </span>
                    <span> Posts</span>
                  </div>
                  <div>
                    <span className="font-bold">
                      {userProfile?.followers.length}
                    </span>
                    <span> followers</span>
                  </div>
                  <div>
                    <span className="font-bold">
                      {userProfile?.following.length}
                    </span>
                    <span> following</span>
                  </div>
                </div>
                <p className="w-80 font-medium">
                  {userProfile?.bio || "Nexora User"}
                </p>
              </div>
            </div>
            {/* Bottom Profile and Save */}
            <div className="mt-10">
              <div className="flex items-center justify-center space-x-14">
                <div
                  className={cn(
                    "flex items-center space-x-2 cursor-pointer",
                    postOrSave === "POST" && "text-blue-500"
                  )}
                  onClick={() => setPostOrSave("POST")}
                >
                  <Grid />
                  <span className="font-semibold">Post</span>
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-2 cursor-pointer",
                    postOrSave === "SAVE" && "text-blue-500"
                  )}
                  onClick={() => setPostOrSave("SAVE")}
                >
                  <Bookmark />
                  <span className="font-semibold">Saved</span>
                </div>
              </div>
              {postOrSave === "POST" && <Post userProfile={userProfile} />}
              {postOrSave === "SAVE" && <Save userProfile={userProfile} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
