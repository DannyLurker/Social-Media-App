import { Post, User } from "@/types";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import { Avatar } from "../ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { User2Icon } from "lucide-react";
import DotButton from "./DotButton";
import { Button } from "../ui/button";

type Props = {
  user: User | null;
  post: Post | null;
};

const Comment = ({ user, post }: Props) => {
  const [comment, setComment] = useState("");
  const dispatch = useDispatch();
  const addCommentHandler = async (id: string) => {};
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <p className="text-sm sm:text-base font-semibold">
            View All {post!.comments.length} Comment
          </p>
        </DialogTrigger>
        <DialogContent className="flex flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1100px] p-0 gap-0  ">
          <DialogTitle></DialogTitle>
          <div className="flex flex-1">
            <div className="sm:w-1/2 hidden max-h-[80vh] sm:block">
              <Image
                src={`${post?.image?.url}`}
                alt={"Post Image"}
                width={300}
                height={300}
                className="w-full object-cover h-full rounded-l-lg"
              />
            </div>
            <div className="w-full sm:w-1/2 flex flex-col justify-between">
              <div className="flex items-center mt-4 justify-between p-4">
                <div className="flex gap-3 items-center">
                  <Avatar
                    className={
                      user?.profilePicture
                        ? ""
                        : "border-gray-700 border-[2] rounded-full flex justify-center items-center"
                    }
                  >
                    <AvatarImage
                      src={`${user?.profilePicture}`}
                      className="h-full w-full rounded-full"
                    />
                    <AvatarFallback>
                      <User2Icon />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">
                      {user?.username}
                    </p>
                  </div>
                </div>
                <DotButton post={post} user={user} />
              </div>
              <hr />
              <div className="flex-1 overflow-y-auto max-h-96 p-4">
                {post?.comments.map((item) => {
                  return (
                    <div
                      key={item?._id}
                      className="flex mb-4 gap-3 items-center"
                    >
                      <Avatar
                        className={
                          item?.user?.profilePicture
                            ? ""
                            : "border-gray-700 border-[2] rounded-full flex justify-center items-center"
                        }
                      >
                        <AvatarImage
                          src={`${item?.user?.profilePicture}`}
                          className="h-full w-full rounded-full"
                        />
                        <AvatarFallback>
                          <User2Icon />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold">
                          {item?.user?.username}
                        </p>
                        <p className="font-normal text-sm">{item?.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a Comment"
                      className="w-full outline-none rounded border p-2 text-sm border-gray-300"
                    />
                    <Button variant={"secondary"}>Send</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Comment;
