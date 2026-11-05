import { ReactNode } from "react";

export default function SubBorderWrapper({
  children,
  addOns,
}: {
  children: ReactNode;
  addOns?: string;
}) {
  return (
    <div
      className={`md:p-3 p-2  border-2 border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-blk4 ${addOns}`}
    >
      {children}
    </div>
  );
}
