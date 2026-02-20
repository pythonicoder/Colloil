import React from "react";

export const Badge = ({ children, className = "" }) => {
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 ${className}`}
    >
      {children}
    </span>
  );
};