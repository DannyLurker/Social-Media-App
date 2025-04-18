"use clinet";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { RootState } from "@/store/store";
import {
  Heart,
  HomeIcon,
  icons,
  LogOut,
  LogOutIcon,
  MessageCircle,
  Search,
  SquarePlus,
} from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import Image from "next/image";

const LeftSidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const sidebarLinks = [
    {
      icon: <HomeIcon />,
      label: "Home",
    },
    {
      icon: <Search />,
      label: "Search",
    },
    {
      icon: <MessageCircle />,
      label: "Message",
    },
    {
      icon: <Heart />,
      label: "Notification",
    },
    {
      icon: <SquarePlus />,
      label: "Create",
    },
    {
      icon: (
        <Avatar className="w-9 h-9">
          <AvatarImage src={user?.profilePicture} className="h-full w-full" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
    {
      icon: <LogOutIcon />,
      label: "Logout",
    },
  ];

  return (
    <>
      <div className="h-full ">
        <div>
          <Image
            src={"/images/logo.png"}
            alt="logo"
            width={150}
            height={150}
            className="mt[-2rem] mx-auto"
          ></Image>
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
