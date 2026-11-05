import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  active: boolean;
}

export const OnClickMainBtn = ({ children, onClick, active }: ButtonProps) => {
  return (
    <div
      className={`cursor-pointer  hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-700 focus:outline-none  font-medium rounded-lg px-3 py-2  mb-2 ${
        active
          ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white"
          : ""
      }`}
      onClick={() => {
        onClick();
      }}
    >
      {children}
    </div>
  );
};
