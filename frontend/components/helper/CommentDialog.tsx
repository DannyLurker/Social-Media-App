import { Post, User } from "@/types";
import { Dialog, DialogContent } from "../ui/dialog";
import Comment from "./Comment";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  user: User | null;
};

const CommentDialog = ({ open, onOpenChange, post, user }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1024px] p-0 flex flex-col">
      <Comment user={user} post={post} />
    </DialogContent>
  </Dialog>
);

export default CommentDialog;
