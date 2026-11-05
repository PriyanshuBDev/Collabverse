import { useEffect, useState } from "react";
import {
  Tier,
  usersProjFilterProps,
  usersTaskFilterProps,
  wsUserProps,
} from "../../../app/interfaces";

import ListCard from "./ListCard";
import Pagination from "./Pagination";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useWsUserList } from "@/lib/queries/workspace/users/useWsUserList";
import { toast } from "sonner";
import { combinedRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import Spinner1 from "@/components/loadings/Spinner1";

export default function ListViewUsers({
  search,
  project,
  task,
}: {
  search: string;
  project?: usersProjFilterProps;
  task?: usersTaskFilterProps;
}) {
  const [page, setPage] = useState(1);
  const {
    data,
    isFetching,
    isError,
    removeUser,
    removing,
    changeRole,
    changingRole,
  } = useWsUserList(page, setPage, project?.id, task?.id, search);
  useEffect(() => {
    setPage(1);
  }, [project, task]);

  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong while fetching users");
    }
  }, [isError]);

  if (isFetching) {
    return <TableSkeleton />;
  }
  if (!data || data.users.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center text-xs sm:text-base lg:text-xl">
          No users found
        </div>
      </div>
    );
  }
  const type: Tier = data?.type ?? "Workspace";
  return (
    <div>
      <div className="relative overflow-x-auto overflow-y-hidden rounded-lg mt-2 transition-all duration-300 shadow-sm">
        <table className=" w-full text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-[10px] sm:text-xs lg:text-sm text-gray-700 uppercase bg-gray-200 dark:bg-blk4 dark:text-gray-400 z-20 shadow-md">
            <tr>
              <th scope="col" className="px-6 py-2 lg:py-3 ">
                User
              </th>
              {type === "Workspace" && (
                <th scope="col" className="px-6 py-2 lg:py-3">
                  Projects
                </th>
              )}
              {(type === "Workspace" || type === "Project") && (
                <th scope="col" className="px-6 py-2 lg:py-3">
                  Tasks
                </th>
              )}
              <th scope="col" className="px-6 py-2 lg:py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-2 lg:py-3">
                Joined At
              </th>

              <th scope="col" className="px-3 py-2 lg:py-3"></th>
            </tr>
          </thead>
          <tbody className="lg:text-base text-xs ">
            {data.users.map((u: wsUserProps) => (
              <ListCard
                user={u}
                onRemove={() => removeUser({ userId: u.id })}
                removing={removing}
                onChangeRole={(role: combinedRoleChange) =>
                  changeRole({ role, userId: u.id })
                }
                changingRole={changingRole}
                type={type}
                key={u.id}
                project={project}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        total={data.total}
        totalPage={Math.ceil(data.total / data.limit)}
        page={page}
        setPage={setPage}
      ></Pagination>
      {
        <div
          className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 ${
            removing || changingRole
              ? "visible"
              : "invisible pointer-events-none"
          }`}
        >
          <Spinner1
            fill="fill-gray-800 dark:fill-gray-200"
            size="size-10 lg:size-16"
            color="text-gray-200 dark:text-blk3"
          ></Spinner1>
        </div>
      }
    </div>
  );
}
