"use client";
import { RootState } from "@/store/store";
import React from "react";
import { useSelector } from "react-redux";

const Home = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  console.log(user);

  return (
    <>
      <h1>Home Page</h1>
    </>
  );
};

export default Home;
