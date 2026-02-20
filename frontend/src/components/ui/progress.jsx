import React from "react";

export const Progress = ({ value = 0 }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="bg-green-600 h-3 rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};