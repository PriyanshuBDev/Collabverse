import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  active: boolean;
}

export const OnClickBtn = ({ children, onClick, active }: ButtonProps) => {
  return (
    <div
      className={`cursor-pointer  hover:bg-gray-300 dark:hover:bg-blk3 focus:outline-none  font-medium rounded-lg px-3 py-2  mb-2 ${
        active ? "bg-gray-300 dark:bg-blk3 dark:text-gray-200" : ""
      }`}
      onClick={() => {
        onClick();
      }}
    >
      {children}
    </div>
  );
};
