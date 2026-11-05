import { wsRoleChange } from "@/lib/axios/workspace/users/changeUserRole";

import { Dispatch, SetStateAction } from "react";

export default function RolesSelector({
  roles,
  setRole,
  role,
}: {
  roles: wsRoleChange[];
  setRole: Dispatch<SetStateAction<wsRoleChange>>;
  role: wsRoleChange;
}) {
  return (
    <div className=" flex items-center  gap-3">
      {roles.map((r: wsRoleChange, idx: number) => (
        <div key={idx} className="flex items-center">
          <div className="w-fit flex items-center justify-center">
            <input
              type="radio"
              name="options"
              checked={r === role}
              onChange={() => setRole(r)}
              className="
                      relative w-4 h-4 rounded-full
                      border-2 border-gray-500 dark:border-gray-300
                      appearance-none
                      cursor-pointer

                      checked:border-brand
                      checked:bg-brand

                      before:content-['']
                      before:absolute
                      before:top-1/2 before:left-1/2
                      before:h-2 before:w-2
                      before:-translate-x-1/2 before:-translate-y-1/2
                      before:rounded-full
                      before:bg-blue-500
                      before:scale-0

                      checked:before:scale-100
                      transition-all
                    "
            />
          </div>
          <label className="w-full py-1 select-none ms-2 text-sm font-medium text-heading">
            {r}
          </label>
        </div>
      ))}
    </div>
  );
}
