"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { setPost } from "@/store/postSlice";
import {
  Bookmark,
  HeartIcon,
  Loader,
  MessageCircle,
  Send,
  Users2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { AvatarImage } from "../ui/avatar";
import DotButton from "../helper/DotButton";
import Image from "next/image";
import Comment from "../helper/Comment";

const Feed = () => {
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.post.posts);

  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAllPost = async () => {
      const getAllPostReq = async () => {
        return await axios.get(`${BASE_API_URL}/posts/all`);
      };

      const result = await handleAuthRequest(getAllPostReq, setIsLoading);

      if (result) {
        dispatch(setPost(result.data.data.posts));
      }
    };

    getAllPost();
  }, [dispatch]);

  const handleLikeOrDislike = () => {};

  const handleSaveUnsave = () => {};

  const handleComment = (id: string) => {};

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col ">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (posts.length < 1) {
    return (
      <div className="text-3xl text-center m-8 capitalize font-bold">
        No Posts To Show
      </div>
    );
  }

  return (
    <>
      <div className="mt-20 w-[70%] mx-auto">
        {/* Main Post */}
        {posts.map((post) => {
          return (
            <div key={post._id} className="mt-8">
              <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <Avatar
                    className={
                      post.user?.profilePicture
                        ? "w-9 h-9"
                        : "w-9 h-9 border-gray-700 border-[2] rounded-full flex justify-center items-center"
                    }
                  >
                    <AvatarImage
                      src={`${post.user?.profilePicture}`}
                      className="h-full w-full rounded-full"
                    />
                    <AvatarFallback>
                      <Users2Icon className="w-[10rem] h-[10rem]" />
                    </AvatarFallback>
                  </Avatar>
                  <h1>{post.user?.username}</h1>
                  {/* DotButton */}
                </div>
                <DotButton />
              </div>
              <div>
                {/* Image */}
                <div className="mt-2">
                  <Image
                    src={`${post.image?.url}`}
                    alt={"Post"}
                    width={400}
                    height={400}
                    className={"w-full"}
                  />
                </div>
                <div className="flex mt-3 items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <HeartIcon className="cursor-pointer" />
                    <MessageCircle className="cursor-pointer" />
                    <Send className="cursor-pointer" />
                  </div>
                  <Bookmark className="cursor-pointer" />
                </div>
                <h1 className="mt-2 text-sm font-semibold">
                  {post.likes.length} likes
                </h1>
                <p className="mt-2 font-medium">{post.caption}</p>
                <Comment />
                <div className="mt-2 flex items-center">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 placeholder:text-gray-800 outline-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <p
                    role="button"
                    className="text-sm font-semibold text-blue-700 cursor-pointer"
                    onClick={() => {
                      handleComment(post._id);
                    }}
                  >
                    Post
                  </p>
                </div>
                <div className="pb-6 border-b-2"></div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Feed;
