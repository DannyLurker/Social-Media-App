"use clinet";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { RootState } from "@/store/store";
import {
  Heart,
  HomeIcon,
  InfoIcon,
  LogOutIcon,
  MessageCircle,
  Search,
  SquarePlus,
  User2Icon,
} from "lucide-react";
import React, { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { handleAuthRequest } from "../utils/apiRequest";
import { BASE_API_URL } from "@/server";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";
import CreatePostModel from "./CreatePostModel";
import InformationDialog from "./InformationDialog";
import SearchDialog from "./SearchDialog";

const LeftSidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isCreateDialogOpen, setCreateIsDialogOpen] = useState<boolean>(false);
  const [isInformationDialogOpen, setIsInformationDialogOpen] =
    useState<boolean>(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    const logoutReq = async () => {
      return await axios.post(
        `${BASE_API_URL}/users/logout`,
        {},
        { withCredentials: true }
      );
    };

    const result = await handleAuthRequest(logoutReq);

    if (result) {
      dispatch(setAuthUser(null));
      toast.success(result.data.message);
      router.push("/auth/login");
    }
  };

  const handleSidebar = (label: string) => {
    if (label === "Home") router.push("/");
    if (label === "Logout") handleLogout();
    if (label === "Profile") {
      if (!user || !user._id) {
        toast.error("User not found or not logged in");
        return;
      }
      router.push(`/profile/${user._id}`);
    }
    if (label === "Create") setCreateIsDialogOpen(true);
    if (label === "Information") setIsInformationDialogOpen(true);
    if (label === "Search") setIsSearchDialogOpen(true);
  };

  const sidebarLinks = [
    {
      icon: <HomeIcon />,
      label: "Home",
    },
    {
      icon: <Search />,
      label: "Search",
    },
    // {
    //   icon: <MessageCircle />,
    //   label: "Message",
    // },
    // {
    //   icon: <Heart />,
    //   label: "Notification",
    // },
    {
      icon: <SquarePlus />,
      label: "Create",
    },
    {
      icon: (
        // Tanpa flex, elemen anak mungkin tidak akan menyesuaikan ukurannya dengan container, sehingga gambar tidak akan mengikuti ukuran w-9 h-9.
        <Avatar className="w-9 h-9 flex justify-center items-center">
          <AvatarImage
            src={user?.profilePicture?.url}
            className="h-full w-full rounded-full"
          />
          <AvatarFallback>
            <User2Icon />
          </AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
    {
      icon: <LogOutIcon />,
      label: "Logout",
    },
    {
      icon: <InfoIcon />,
      label: "Information",
    },
  ];

  return (
    <>
      <div className="h-full ">
        <CreatePostModel
          isOpen={isCreateDialogOpen}
          onClose={() => setCreateIsDialogOpen(false)}
        />
        <InformationDialog
          isOpen={isInformationDialogOpen}
          onClose={() => setIsInformationDialogOpen(false)}
        />
        <SearchDialog
          isOpen={isSearchDialogOpen}
          onClose={() => setIsSearchDialogOpen(false)}
        />
        <div
          onClick={() => router.push("/")}
          className="lg:p-6 p-3 cursor-pointer"
        >
          <Image
            src={"/images/logo.png"}
            alt="logo"
            width={150}
            height={150}
            className="mt[-2rem] mx-auto "
          />
        </div>
        <div className="mt-6">
          {sidebarLinks.map((link) => {
            return (
              <div
                key={link.label}
                className="flex items-center mb-2 p-3 rounded-lg group cursor-pointer transition-all duration-200 hover:bg-gray-100 space-x-2"
                onClick={(e: FormEvent) => {
                  handleSidebar(link.label);
                }}
              >
                <div className="group-hover:scale-110 transition-all duration-200">
                  {link.icon}
                </div>
                <p className="lg:text-lg text-base">{link.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
