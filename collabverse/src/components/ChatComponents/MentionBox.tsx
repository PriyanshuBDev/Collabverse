// MentionList.tsx
import React, { useEffect, useState, useRef } from "react";
import { memberProps } from "../../app/interfaces";
import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import colorFromName from "@/lib/functions/colors/colorFromName";
interface MentionCommand {
  (props: {
    id: string;
    name: string;
    avatar?: string;
    userName: string;
  }): void;
}
export default function MentionList({
  items,
  command,
}: {
  items: memberProps[];
  command: MentionCommand;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item)
      command({
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        userName: item.username,
      });
  };

  const upHandler = () =>
    setSelectedIndex((i) => (i + items.length - 1) % items.length);
  const downHandler = () => setSelectedIndex((i) => (i + 1) % items.length);
  const enterHandler = () => selectItem(selectedIndex);

  useEffect(() => {
    ref.current?.scrollTo({
      top: selectedIndex * 40,
      behavior: "smooth",
    });
  }, [selectedIndex]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") upHandler();
      if (event.key === "ArrowDown") downHandler();
      if (event.key === "Enter") enterHandler();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  if (!items.length) {
    return null;
  }
  console.log(items);
  return (
    <div
      ref={ref}
      className="max-h-30 overflow-y-auto w-full scrollbar-none bg-gray-200 dark:bg-blk4 min-w-40 py-3 rounded-lg px-1"
    >
      {items.map((user: memberProps, idx: number) => (
        <div
          key={idx}
          className={`py-1 px-2 cursor-pointer flex items-center gap-1 w-full hover:dark:bg-blk9 hover:bg-gray-300 rounded-lg`}
          onClick={() => selectItem(idx)}
        >
          <div className="w-fit">
            {user.avatar ? (
              <div
                className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                onClick={() => {}}
              >
                <Image
                  alt={"UserAvatar"}
                  src={user.avatar}
                  className="object-center object-cover"
                  fill
                ></Image>
              </div>
            ) : (
              <div
                className={`w-4 h-4 lg:h-5 lg:w-5 rounded-full flex justify-center items-center cursor-pointer ${colorFromName(
                  user.name,
                )}`}
                onClick={() => {}}
              >
                <div className="font-semibold text-xs text-white">
                  {getInitials(user.name)}
                </div>
              </div>
            )}
          </div>
          <div className="text-gray-800 dark:text-gray-200 text-xs md:text-sm font-semibold w-full">
            {user.name}
          </div>
        </div>
      ))}
    </div>
  );
}
