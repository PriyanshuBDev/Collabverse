import { GroupHeaderProps } from "@/app/interfaces";

import { ChatListType } from "@prisma/client";
import GroupHeader from "../../groupCard/GroupHeader";
import DmHeader from "../../userCard/DmHeader";
import { Dispatch, SetStateAction } from "react";

export default function ChatHeader({
  type,
  headerData,
  showDelete,
  setIsHeaderLoading,
}: {
  type: ChatListType;
  headerData: GroupHeaderProps;
  showDelete: boolean;
  setIsHeaderLoading: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className={`transition-all duration-300 ${
        !showDelete
          ? "opacity-100 max-h-15 "
          : "opacity-0 max-h-0 pointer-events-none"
      }`}
    >
      {type === "Group" ? (
        <GroupHeader
          headerData={headerData}
          setIsHeaderLoading={setIsHeaderLoading}
        />
      ) : (
        <DmHeader setIsHeaderLoading={setIsHeaderLoading} />
      )}
    </div>
  );
}
