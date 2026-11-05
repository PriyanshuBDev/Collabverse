import { $Enums } from "@prisma/client";

export interface rolesProps {
  role: $Enums.WsRole;
  permissions: $Enums.WsPermission[];
}
export function findPermission({
  roles,
  role,
  permission,
}: {
  roles?: rolesProps[];
  role: $Enums.WsRole;
  permission: $Enums.WsPermission;
}) {
  return (
    roles
      ?.find((r: rolesProps) => r.role === role)
      ?.permissions.includes(permission) ?? false
  );
}
