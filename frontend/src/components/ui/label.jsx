import React from "react";

export const Label = ({ children, className = "", ...props }) => {
  return (
    <label className={`block mb-1 font-medium ${className}`} {...props}>
      {children}
    </label>
  );
};