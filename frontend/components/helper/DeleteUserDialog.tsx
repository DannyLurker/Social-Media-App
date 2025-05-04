import React from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { User } from "@/types";

type Props = {
  user: User;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const DeleteUserDialog = ({ user, isOpen, onOpenChange }: Props) => {
  const handleDeleteUser = (id: string) => {};
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="h-[20vh]">
          <DialogTitle>
            <p className="text-center">
              Are you sure delete "{user.username}" ?
            </p>{" "}
          </DialogTitle>
          <div className="flex justify-center">
            {user.role == "owner" ? (
              ""
            ) : user.role == "admin" ? (
              <Button
                onClick={() => handleDeleteUser(user._id)}
                className="w-fit"
                variant={"destructive"}
              >
                Delete "{user.username}"
              </Button>
            ) : user.role == "user" ? (
              <Button
                onClick={() => handleDeleteUser(user._id)}
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
    </>
  );
};

export default DeleteUserDialog;
