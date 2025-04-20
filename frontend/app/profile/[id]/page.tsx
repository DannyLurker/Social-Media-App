import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  const getParams = await params;
  console.log(getParams);
  return <div>Profile page</div>;
};

export default page;
