import React from "react";

export default function GlassWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl lg:p-8 p-5  shadow-xl lg:w-md w-sm">
      {children}
    </div>
  );
}
