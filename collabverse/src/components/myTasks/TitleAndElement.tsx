import { ReactNode } from "react";

export default function TitleAndElement({
  title,
  children,
  addons,
}: {
  title: string;
  children: ReactNode;
  addons?: string;
}) {
  return (
    <div>
      <div
        className={`text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold ${addons}`}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
