import { allRole, Tier } from "@/app/interfaces";
import { useIsAllowed } from "@/lib/hooks/useIsAllowed";
import { canRemoveUser } from "@/lib/hooks/useRemovePerm";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { PPermission, PRole } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

export default function RemoveDD({
  type,
  setWarning,
  setShowOptions,
  showOptions,
  projectRole,
  userRole,
  projectPerms,
  gap,
  color,
  hover,
}: {
  type: Tier;
  setWarning: Dispatch<SetStateAction<boolean>>;
  setShowOptions: Dispatch<SetStateAction<boolean>>;
  showOptions: boolean;
  projectRole?: PRole;
  userRole: allRole;
  projectPerms: PPermission[];
  gap?: string;
  color?: string;
  hover?: string;
}) {
  const { role } = useCurrentWorkspace();
  const adminRemovePerm = useIsAllowed("Remove_Member", "admin");
  const canRemove = canRemoveUser({
    type,
    currentWsRole: role,
    currentProjectRole: projectRole,
    targetRole: userRole,
    isSelf: false, // already filtered before showing menu
    adminRemovePerm,
    projectPerms,
  });
  return (
    <div className="relative">
      <div
        className={`absolute  w-fit ${gap ?? "left-8 -top-6"}  ${color ?? "bg-gray-200 dark:bg-blk5"} rounded-md p-1 text-nowrap z-100 transition-all duration-300 ${
          showOptions
            ? "opacity-100 -translate-x-0 visible"
            : "opacity-0 -translate-x-10 invisible pointer-events-none"
        } `}
      >
        <ul className="w-full   ">
          {canRemove && (
            <li
              className={`px-2 text-gray-800 dark:text-gray-200 text-sm lg:text-base ${hover ?? "hover:bg-gray-300 dark:hover:bg-blk4"} `}
              onClick={() => {
                setWarning(true);
                setShowOptions(false);
              }}
            >
              Remove from {type.toLowerCase()}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
