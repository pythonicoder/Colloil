import React from "react";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children }) => (
  <div className="space-y-4">{children}</div>
);

export const DialogHeader = ({ children }) => (
  <div className="border-b pb-2 mb-2">{children}</div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);

export const DialogDescription = ({ children }) => (
  <p className="text-gray-600">{children}</p>
);