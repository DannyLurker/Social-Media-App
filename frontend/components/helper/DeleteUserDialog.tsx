"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { User } from "@/types";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { toast } from "sonner";
import { Loader } from "lucide-react";

type Props = {
  user: User;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const DeleteUserDialog = ({ user, isOpen, onOpenChange }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handdleDeleteUserAccount = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await axios.delete(
        `${BASE_API_URL}/users/delete-account/${id}`,
        { withCredentials: true }
      );

      if (result) {
        toast.success(result.data.message);
        location.reload();
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="relative">
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="h-[20vh]">
            <DialogTitle>
              <p className="text-center">
                Are you sure delete "{user.username}" ?
              </p>{" "}
            </DialogTitle>
            {isLoading && (
              <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center">
                <Loader className="animate-spin w-10 h-10 text-gray-700" />
              </div>
            )}
            <div className="flex justify-center">
              {user.role == "owner" ? (
                ""
              ) : user.role == "admin" ? (
                <Button
                  onClick={() => handdleDeleteUserAccount(user._id)}
                  className="w-fit"
                  variant={"destructive"}
                >
                  Delete "{user.username}"
                </Button>
              ) : user.role == "user" ? (
                <Button
                  onClick={() => handdleDeleteUserAccount(user._id)}
                  className="w-fit"
                  variant={"destructive"}
                >
                  Delete "{user.username}"
                </Button>
              ) : (
                ""
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default DeleteUserDialog;
