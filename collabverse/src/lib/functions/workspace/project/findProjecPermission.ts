import { $Enums } from "@prisma/client";

export interface rolesProps {
  role: $Enums.PRole;
  permissions: $Enums.PPermission[];
}
export function findProjectPermission({
  roles,
  role,
  permission,
}: {
  roles?: rolesProps[];
  role: $Enums.PRole;
  permission: $Enums.PPermission;
}) {
  return (
    roles
      ?.find((r: rolesProps) => r.role === role)
      ?.permissions.includes(permission) ?? false
  );
}
