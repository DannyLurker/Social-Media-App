"use clinet";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { RootState } from "@/store/store";
import {
  Heart,
  HomeIcon,
  LogOutIcon,
  MessageCircle,
  Search,
  SquarePlus,
  User2Icon,
} from "lucide-react";
import React, { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { handleAuthRequest } from "../utils/apiRequest";
import { BASE_API_URL } from "@/server";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";

const LeftSidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

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
        // Tanpa flex, elemen anak mungkin tidak akan menyesuaikan ukurannya dengan container, sehingga gambar tidak akan mengikuti ukuran w-9 h-9.
        <Avatar className="w-9 h-9 flex justify-center items-center">
          <AvatarImage
            src={user?.profilePicture}
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
  ];

  return (
    <>
      <div className="h-full ">
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
          <div className="mt-6">
            {sidebarLinks.map((link) => {
              return (
                <div
                  key={link.label}
                  className="flex items-center mb-2 p-3 rounded-lg group cursor-pointer transition-all duration-200 hover:bg-gray-100 space-x-2"
                  onClick={(e: FormEvent) => {
                    // Untuk mencegah event bubling, dikarena nested div, di ln 104 terdapat event click yang menuju   "/"
                    e.stopPropagation();
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
      </div>
    </>
  );
};

export default LeftSidebar;
