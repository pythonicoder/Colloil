import React from "react";

export const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 ${className}`}
      {...props}
    />
  );
};