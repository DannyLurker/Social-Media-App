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
import { Ellipsis, Loader } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";
import { deletePost } from "@/store/postSlice";

type Props = {
  post: Post | null;
  user: User | null;
};

const DotButton = ({ post, user }: Props) => {
  const dispatch = useDispatch();
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

  const handleDeletePost = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await axios.delete(
        `${BASE_API_URL}/posts/delete-post/${id}`,
        {
          withCredentials: true,
        }
      );

      if (result) {
        setIsLoading(false);
        dispatch(deletePost(id));
        toast.success(result.data.message);
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Ellipsis className="w-8 h-8 text-black cursor-pointer" />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle></DialogTitle>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center">
                <Loader className="animate-spin w-10 h-10 text-gray-700" />
              </div>
            )}
            <div className="space-y-4 flex flex-col w-fit justify-center items-center mx-auto">
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
                  <Button
                    variant={"destructive"}
                    // post?.id dibutuhkah karena untuk menghindari error undefined
                    onClick={() =>
                      post?._id && handleDeletePost(post._id.toString())
                    }
                  >
                    Delete Post
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* By using asChild, we tell Radix UI to use the child component's element instead of creating a new one, avoiding the nesting issue. */}
          <DialogClose asChild>
            <div className="flex justify-center">
              <Button variant={"secondary"} className="w-fit">
                Cancel
              </Button>
            </div>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DotButton;
