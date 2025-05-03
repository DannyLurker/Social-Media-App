"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Loader, SearchIcon, User2Icon } from "lucide-react";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { User } from "@/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchDialog = ({ isOpen, onClose }: Props) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle className="flex justify-center">
            <p className="mr-2">Search</p> <SearchIcon />
          </DialogTitle>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center">
                <Loader className="animate-spin w-10 h-10 text-gray-700" />
              </div>
            )}
            <div className="flex gap-2">
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
                            src={`${user?.profilePicture}`}
                            className="h-full w-full rounded-full"
                          />
                          <AvatarFallback>
                            <User2Icon />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h1 className="font-bold">{user?.username}</h1>
                          <p className="text-gray-700">
                            {user?.bio || "Nexora User"}
                          </p>
                        </div>
                      </div>
                      <h1
                        className="font-medium text-blue-700 cursor-pointer"
                        onClick={() => {
                          router.push(`/profile/${user?._id}`);
                        }}
                      >
                        {currentUser?._id === user?._id ? "" : "Details"}
                      </h1>
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchDialog;
