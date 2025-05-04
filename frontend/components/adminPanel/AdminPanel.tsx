"use client";
import React, { useEffect, useState } from "react";
import LeftSidebar from "../Home/LeftSidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Loader, MenuIcon, User2Icon } from "lucide-react";
import RightSidebar from "../Home/RightSidebar";
import { User } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import UserSettingsButton from "../helper/UserSettingsButton";

const AdminPanel = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const [searchUser, setSearchUser] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userList, setUserList] = useState<User[]>([]);
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("search") || "";

  const findUser = async () => {
    try {
      setIsLoading(true);
      const result = await axios.get(`${BASE_API_URL}/users/find-user`, {
        params: { search: searchValue },
      });

      if (result) {
        setUserList(result.data.data.users);
        setIsLoading(false);
      }
    } catch (error) {
      setUserList([]);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("search", searchUser);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    findUser();
  }, [searchValue]);

  if (user?.role !== "admin" && user?.role !== "owner") {
    toast.error("You're not authorized");
    router.push("/");
    return;
  }

  return (
    <>
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
          <div className="relative">
            <div className="flex w-full h-[75vh] justify-center items-center">
              <div className="h-[300px] w-[350px] max-h-[400px] sm:w=[450px] sm:h-[450px] md:w-[600px] md:h-[700px]  border-2 p-2">
                <div className="p-2">
                  <h1 className="font-bold text-center">Admin Panel</h1>
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    className="w-full h-8 rounded-md border-2 outline-none border-neutral-300 px-3 py-[18px]"
                    placeholder="Search..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />
                  <Button onClick={handleSearch}>Search</Button>
                </div>
                {userList.length > 0 &&
                  userList.map((user) => {
                    return (
                      <div
                        key={user?._id.toString()}
                        className="mt-6 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 cursor-pointer">
                            <Avatar
                              className={
                                user
                                  ? "w-9 h-9"
                                  : "w-9 h-9 border-gray-700 border-[2] rounded-full flex justify-center items-center"
                              }
                            >
                              <AvatarImage
                                src={user?.profilePicture?.url}
                                className="h-full w-full rounded-full"
                              />
                              <AvatarFallback>
                                <User2Icon />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h1 className="font-bold">{user?.username}</h1>
                              <p className="text-gray-700 capitalize">
                                {user.role}
                              </p>
                            </div>
                          </div>
                          <UserSettingsButton user={user} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
        <div className="w-[30%] pt-8 px-6 lg:block hidden">
          <RightSidebar />
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
