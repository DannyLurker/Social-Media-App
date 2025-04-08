import React from "react";

const productId = async ({ params }: { params: Promise<{ id: string }> }) => {
  const idProduct = (await params).id;

  return <div>{idProduct}</div>;
};

export default productId;
