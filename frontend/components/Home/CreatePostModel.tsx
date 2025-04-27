import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import LoadingButton from "../helper/LoadingButton";
import { DialogHeader } from "../ui/dialog";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { BASE_API_URL } from "@/server";
import axios from "axios";
import { handleAuthRequest } from "../utils/apiRequest";
import { addPost } from "@/store/postSlice";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CreatePostModel = ({ isOpen, onClose }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Menghapus data ketika user menutup create model
    if (!isOpen) {
      setSelectedImage(null);
      setPreviewImage(null);
      setCaption("");
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file!");
        return;
      }

      // valid size check
      if (file.size > 10 * 1024 * 1024) {
        toast.error("FIle size shouldn't be exceed 10MB");
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleCreatePost = async (e: FormEvent) => {
    if (!selectedImage) {
      toast.error("Please Select an image to create a post!");
    }

    const formData = new FormData();
    formData.append("caption", caption);
    if (selectedImage) formData.append("image", selectedImage);

    const createPostReq = async () => {
      return await axios.post(`${BASE_API_URL}/posts/create-post`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    };

    const result = await handleAuthRequest(createPostReq, setIsLoading);

    if (result) {
      dispatch(addPost(result.data.data.post));
      toast.success("Post created Successfully");
      setPreviewImage(null);
      setCaption("");
      setSelectedImage(null);
      onClose();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-2xl w-full">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          {previewImage ? (
            // Only show the selected image and the input for caption when image is choosen
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="mt-4">
                <Image
                  src={previewImage}
                  alt="image"
                  width={400}
                  height={400}
                  className="overflow-auto max-h-96 rounded-md object-contain w-full"
                />
              </div>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="mt-4 p-2 border rounded-md w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex space-x-4 mt-4">
                <LoadingButton
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleCreatePost}
                  isLoading={isLoading}
                >
                  Create Post
                </LoadingButton>
                <button
                  className="bg-gray-500 text-white hover:bg-gray-600 px-2 py-1 rounded-md"
                  onClick={() => {
                    setPreviewImage(null);
                    setSelectedImage(null);
                    setCaption("");
                    onClose();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Show the default view
            <>
              <DialogHeader>
                <DialogTitle className="text-center mt-3 mb-3">
                  Upload Photo
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="flex space-x-2 text-gray-600">
                  <ImageIcon size={40} />
                </div>
                <p className="text-gray-600 mt-4">
                  Select a photo from your device
                </p>
                <button
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-md px-2 py-1"
                  onClick={handleButtonClick}
                >
                  Select From Device
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CreatePostModel;
