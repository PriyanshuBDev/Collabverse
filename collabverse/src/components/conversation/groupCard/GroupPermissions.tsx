import { GroupData, groupPermissions } from "@/app/interfaces";
import CheckToggler from "@/components/Toggler/CheckToggler";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import { useGroupData } from "@/lib/queries/workspace/conversation/group/useGroupData";
import { GroupPerm, GroupRole } from "@prisma/client";

export default function GroupPermissions({
  data,
  currentUserRole,
}: {
  data: GroupData;
  currentUserRole?: GroupRole;
}) {
  const {
    togglePerm: { mutate, isPending },
  } = useGroupData(data.id);
  const disabled = currentUserRole === "Member" || isPending;
  function permIncludes(perm: GroupPerm) {
    return data.permissions.includes(perm);
  }
  const perms: groupPermissions = {
    editGroupSettings: permIncludes("Edit_Group_Details"),
    sendFiles: permIncludes("Send_Files"),
    sendMsgs: permIncludes("Send_Messages"),
    pin: permIncludes("Pin"),
  };
  return (
    <div>
      <div className="text-gray-900 dark:text-gray-200 text-lg lg:text-xl font-semibold mb-2 px-1">
        Group Permissions
      </div>
      <div className="text-gray-800 dark:text-gray-300 text-lg lg:text-xl  mb-2 px-1">
        Members can
      </div>
      <div className="px-1 flex flex-col gap-6">
        <FlexBtwWrapper key={"editSettings"}>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Edit group settings
          </div>
          <CheckToggler
            disabled={disabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              mutate({ perm: "Edit_Group_Details", enabled: e.target.checked });
            }}
            state={perms.editGroupSettings}
          />
        </FlexBtwWrapper>
        <FlexBtwWrapper key={"pin"}>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Pin/Unpin
          </div>
          <CheckToggler
            disabled={disabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              mutate({ perm: "Pin", enabled: e.target.checked });
            }}
            state={perms.pin}
          />
        </FlexBtwWrapper>
        <FlexBtwWrapper key={"sendMsgs"}>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Send new messages
          </div>
          <CheckToggler
            disabled={disabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              mutate({ perm: "Send_Messages", enabled: e.target.checked });
            }}
            state={perms.sendMsgs}
          />
        </FlexBtwWrapper>
        <FlexBtwWrapper key={"sendMedia"}>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Send media
          </div>
          <CheckToggler
            disabled={disabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              mutate({ perm: "Send_Files", enabled: e.target.checked });
            }}
            state={perms.sendFiles}
          />
        </FlexBtwWrapper>
      </div>
    </div>
  );
}
