import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const InformationDialog = ({ isOpen, onClose }: Props) => {
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center">
            <DialogTitle>About This Project</DialogTitle>
          </div>

          <div className="flex justify-center items-center py-6">
            <p>
              Hello, I’m Danny, the creator of Nexora — a project brought to
              life by following a YouTube tutorial. Special thanks to WebDev
              Warriors for their excellent guidance and content.
              {"\n"}
              You can check out the tutorial here: 🔗
              https://youtu.be/6XF_uhF4axg?si=-C_GViWdJj7MoqQV
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InformationDialog;
