import React from "react";
import Profile from "@/components/profile/Profile";

const page = async ({ params }: { params: { id: string } }) => {
  const id = (await params).id;

  return (
    <>
      <Profile id={id} />
    </>
  );
};

export default page;
