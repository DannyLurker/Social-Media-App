"use client";
import React, { ChangeEvent } from "react";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  inputClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
}

const PasswordInput = ({
  name,
  label,
  placeholder = "Enter Password",
  value,
  onChange,
  inputClassName = "",
  labelClassName = "",
  iconClassName = "",
}: Props) => {
  return <div></div>;
};

export default PasswordInput;
