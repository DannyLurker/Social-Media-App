import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Ellipsis } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { useDispatch } from "react-redux";
import { deleteComment } from "@/store/postSlice";
import { toast } from "sonner";

type Props = {
  postId: string;
  commentId: string;
  commentText: string;
};

const DeleteCommentDialog = ({ postId, commentId, commentText }: Props) => {
  const dispatch = useDispatch();
  const handleDeletecComment = async () => {
    const handleDeleteCommentReq = async () => {
      return await axios.delete(
        `${BASE_API_URL}/posts/delete-comment/${postId}/${commentId}`,
        {
          withCredentials: true,
        }
      );
    };

    const result = await handleAuthRequest(handleDeleteCommentReq);

    if (result) {
      dispatch(deleteComment({ postId, commentId }));
      toast.success(result.data.message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Ellipsis className="w-8 h-8 text-black cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <div className="flex justify-center items-center">
          <DialogTitle>Delete Comment</DialogTitle>
        </div>

        <div className="flex justify-center items-center py-6">
          <Button variant="destructive" onClick={handleDeletecComment}>
            Delete "{commentText}" Comment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCommentDialog;
