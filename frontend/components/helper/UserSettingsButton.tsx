"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Loader, Settings } from "lucide-react";
import { User } from "@/types";
import { Button } from "../ui/button";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { toast } from "sonner";
import DeleteUserDialog from "./DeleteUserDialog";

type Props = {
  user: User;
};

const UserSettingsButton = ({ user }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleChangeAdmin = async (userTargettedId: string) => {
    const handleChangeAdminReq = async () => {
      return await axios.post(
        `${BASE_API_URL}/users/change-role`,
        {
          targettedUserId: userTargettedId,
        },
        { withCredentials: true }
      );
    };

    const result = await handleAuthRequest(handleChangeAdminReq, setIsLoading);

    if (result) {
      toast.success("Succesfully change user role");
      location.reload();
    }
  };

  return (
    <>
      <div className="relative">
        <Dialog>
          <DialogTrigger>
            <Settings />
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              <p className="text-center">Settings</p>
            </DialogTitle>
            {isLoading && (
              <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center">
                <Loader className="animate-spin w-10 h-10 text-gray-700" />
              </div>
            )}
            <div className="flex flex-col gap-2 w-full items-center">
              {user.role == "owner" ? (
                ""
              ) : user.role == "admin" ? (
                <Button
                  onClick={() => handleChangeAdmin(user._id)}
                  className="w-fit"
                >
                  User
                </Button>
              ) : user.role == "user" ? (
                <Button
                  onClick={() => handleChangeAdmin(user._id)}
                  className="w-fit"
                >
                  Admin
                </Button>
              ) : (
                ""
              )}
              {user.role == "owner" ? (
                <p className="text-center font-bold">Owner Account</p>
              ) : user.role == "admin" ? (
                <Button
                  onClick={() => setIsOpen(true)}
                  className="w-fit"
                  variant={"destructive"}
                >
                  Delete Account
                </Button>
              ) : user.role == "user" ? (
                <Button
                  onClick={() => setIsOpen(true)}
                  className="w-fit"
                  variant={"destructive"}
                >
                  Delete Account
                </Button>
              ) : (
                ""
              )}
              <DeleteUserDialog
                isOpen={isOpen}
                user={user}
                onOpenChange={(isOpen) => {
                  setIsOpen(isOpen);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default UserSettingsButton;
