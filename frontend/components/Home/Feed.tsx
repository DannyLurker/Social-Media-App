"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { addComment, likeOrDislike, setPost } from "@/store/postSlice";
import {
  Bookmark,
  HeartIcon,
  MessageCircle,
  Send,
  Users2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { AvatarImage } from "../ui/avatar";
import DotButton from "../helper/DotButton";
import Image from "next/image";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";
import CommentDialog from "../helper/CommentDialog";

const Feed = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.post.posts);

  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);

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

  const handleLikeOrDislike = async (id: string) => {
    const result = await axios.post(
      `${BASE_API_URL}/posts/like-unlike-post/${id}`,
      {},
      { withCredentials: true }
    );

    if (result.data.status === "success") {
      if (user?._id) {
        dispatch(likeOrDislike({ postId: id, userId: user?._id }));
        toast.success(result.data.message);
      }
    }
  };

  const handleSaveUnsave = async (id: string) => {
    const result = await axios.post(
      `${BASE_API_URL}/posts/save-unsave-post/${id}`,
      {},
      { withCredentials: true }
    );

    if (result.data.status === "success") {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
    }
  };

  const handleComment = async (id: string) => {
    if (!comment) return;

    const addCommentReq = async () => {
      return await axios.post(
        `${BASE_API_URL}/posts/add-comment/${id}`,
        { comment },
        { withCredentials: true }
      );
    };

    try {
      const result = await handleAuthRequest(addCommentReq);

      if (result?.data.status === "success") {
        const newComment = result.data.data.newComment;

        // Update global state
        dispatch(
          addComment({
            postId: id,
            comment: newComment,
          })
        );

        toast.success("Comment Posted");
        setComment("");
      }
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

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
                </div>
                <DotButton post={post} user={user} />
              </div>
              <div>
                {/* Image */}
                <div className="mt-2 flex justify-center">
                  <Image
                    src={`${post.image?.url}`}
                    alt={"Post"}
                    width={400}
                    height={400}
                    className="object-cover"
                  />
                </div>
                <div className="flex mt-3 items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <HeartIcon
                      className={`cursor-pointer ${
                        user?._id && post.likes.includes(user?._id)
                          ? `text-red-500`
                          : ``
                      }`}
                      onClick={() => handleLikeOrDislike(post?._id)}
                    />
                    <MessageCircle
                      className="cursor-pointer"
                      onClick={() => {
                        setActivePostId(post._id);
                        setDialogOpen(true);
                      }}
                    />
                    <Send className="cursor-pointer" />
                  </div>
                  <Bookmark
                    className={`cursor-pointer ${
                      user?.savedPosts?.includes(post?._id as any)
                        ? "text-yellow-300"
                        : ""
                    }`}
                    onClick={() => handleSaveUnsave(post?._id)}
                  />
                </div>
                <h1 className="mt-2 text-sm sm:text-base font-semibold">
                  {post.likes.length} likes
                </h1>
                <p className="mt-2 font-medium">{post.caption}</p>
                <p className="mt-2 text-sm sm:text-base font-semibold">
                  {post?.comments?.length ?? 0}{" "}
                  {(post?.comments?.length ?? 0) > 1 ? "comments" : "comment"}
                </p>
                {activePostId === post._id && (
                  <CommentDialog
                    open={dialogOpen}
                    onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (!open) setActivePostId(null);
                    }}
                    post={post}
                    user={user}
                  />
                )}
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
                      handleComment(post?._id);
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
