import React from "react";

export default function FlexBtwWrapper({
  addOns,
  children,
}: {
  addOns?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between w-full ${addOns}`}>
      {children}
    </div>
  );
}
