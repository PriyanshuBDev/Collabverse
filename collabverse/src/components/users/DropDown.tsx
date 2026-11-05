import { allRole, Tier } from "@/app/interfaces";
import { taskRoleChange } from "@/lib/axios/workspace/project/tasks/users/roleChangeTaskUser";
import { projectRoleChange } from "@/lib/axios/workspace/project/users/roleChangeProjectUser";
import {
  combinedRoleChange,
  wsRoleChange,
} from "@/lib/axios/workspace/users/changeUserRole";
import { PRole, TaskRole, WsRole } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

export default function DropDown({
  type,
  userRole,
  setRole,
  setWarning,
  assignedTasks,
  setShowViewerWarning,
}: {
  type: Tier;
  userRole: allRole;
  setRole: Dispatch<SetStateAction<combinedRoleChange | undefined>>;
  setWarning: Dispatch<SetStateAction<boolean>>;
  assignedTasks?: number;
  setShowViewerWarning: Dispatch<SetStateAction<boolean>>;
}) {
  const wsRoles = Object.values(WsRole).filter(
    (role: "Owner" | "Admin" | "Member") => role !== WsRole.Owner,
  );
  const projectRoles = Object.values(PRole).filter(
    (role: "Owner" | "Manager" | "Contributor" | "Viewer") => role !== "Owner",
  );
  const taskRoles = Object.values(TaskRole);
  return type === "Workspace"
    ? wsRoles.map((w: wsRoleChange, idx: number) => (
        <Drop
          userRole={userRole}
          setRole={setRole}
          setWarning={setWarning}
          key={idx}
          role={w}
        />
      ))
    : type === "Project"
      ? projectRoles.map((p: projectRoleChange, idx: number) => (
          <Drop
            userRole={userRole}
            setRole={setRole}
            setWarning={setWarning}
            key={idx}
            role={p}
            assignedTasks={assignedTasks}
            setShowViewerWarning={setShowViewerWarning}
          />
        ))
      : taskRoles.map((t: taskRoleChange, idx: number) => (
          <Drop
            userRole={userRole}
            setRole={setRole}
            setWarning={setWarning}
            key={idx}
            role={t}
          />
        ));
}

export function Drop<
  T extends wsRoleChange | projectRoleChange | taskRoleChange,
>({
  userRole,
  setRole,
  setWarning,
  role,
  assignedTasks,
  setShowViewerWarning,
}: {
  userRole: allRole;
  setRole: Dispatch<SetStateAction<combinedRoleChange | undefined>>;
  setWarning: Dispatch<SetStateAction<boolean>>;
  role: T;
  assignedTasks?: number;
  setShowViewerWarning?: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className={`text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-blk6  px-2 lg:px-3 py-0.5  text-xs lg:text-base cursor-pointer ${
        role === userRole && "border-l-4 border-blue-500"
      }`}
      onClick={() => {
        if (
          role === "Viewer" &&
          assignedTasks &&
          assignedTasks > 0 &&
          setShowViewerWarning !== undefined
        ) {
          setShowViewerWarning(true);
        } else {
          setRole(role);
          setWarning(true);
        }
      }}
    >
      {role}
    </div>
  );
}
