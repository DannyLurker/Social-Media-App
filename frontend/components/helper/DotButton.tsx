"use client";
import { Post, User } from "@/types";
import React, { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { Dialog, DialogClose } from "../ui/dialog";
import {
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ellipsis } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";

type Props = {
  post: Post | null;
  user: User | null;
};

const DotButton = ({ post, user }: Props) => {
  const id = post?.user?._id;
  const isOwnPost = post?.user?._id === user?._id;
  const isFollowing = post?.user?._id
    ? user?.following.includes(post.user._id)
    : false;

  const [isLoading, setIsLoading] = useState(false);

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
      toast.success(`Successfully Follow ${post?.user?.username}`);
    }
  };

  const dispatch = useDispatch();

  const handleDeletePost = async () => {};

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Ellipsis className="w-8 h-8 text-black cursor-pointer" />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle></DialogTitle>
          <div className="space-y-4 flex flex-col w-fit justify-center items-center mx-auto">
            {!isOwnPost && (
              <div>
                <Button
                  className="cursor-pointer"
                  variant={isFollowing ? "destructive" : "secondary"}
                  onClick={handleFollowUnfollow}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </div>
            )}
            <Link href={`/profile/${post?.user?._id}`}>
              <Button variant={"secondary"}>About This Account</Button>
            </Link>
            {isOwnPost && (
              <Button variant={"destructive"} onClick={handleDeletePost}>
                Delete Post
              </Button>
            )}
          </div>

          <DialogClose>
            <Button variant={"secondary"}>Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DotButton;
