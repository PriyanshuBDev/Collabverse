import { Dispatch, SetStateAction, useState } from "react";
import OverlayWrapper from "../../../wrappers/OverlayWrapper";
import Xbtn from "../../Xbtn";
import FlexBtwWrapper from "../../../wrappers/FlexBtwWrapper";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import Toolbar from "../../../helpers/Toolbar";
import useIsDark from "@/lib/hooks/useIsDark";
import LinkUsernameToggler from "../../../Toggler/LinkUsernameToggler";
import { wsRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import RolesSelector from "../../../selectors/RolesSelector";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useWsInvitation } from "@/lib/queries/workspace/invitation/useWsInvitation";
import UsernameInvitation from "./UsernameInvatation";
import LinkInvitation from "./LinkInvitation";
import ExpireAtPicker from "./ExpireAtPicker";

interface wsProps {
  id: string;
  name: string;
  avatar?: string;
  members: number;
}
export default function WsInviteModal({
  show,
  setShow,
  currentUserRole,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  currentUserRole: string;
}) {
  const wsData = useCurrentWorkspace();
  const { data } = useWsInvitation();
  const [active, setActive] = useState(0);
  const [expireAt, setExpireAt] = useState<Date | undefined>(undefined);
  const isDark = useIsDark();
  const roles: wsRoleChange[] = ["Member"];
  if (currentUserRole !== "Member") {
    roles.push("Admin");
  }
  const [selectedRole, setSelectedRole] = useState<wsRoleChange>("Member");

  const wData: wsProps = {
    id: wsData.id,
    name: wsData.name,
    avatar: data?.avatar ?? undefined,
    members: data?.members ?? 0,
  };

  return (
    <OverlayWrapper active={show}>
      <div className="lg:w-sm w-xs  text-gray-900 dark:text-gray-100">
        <FlexBtwWrapper>
          {" "}
          <div className="text-gray-900 dark:text-gray-100 text-xl font-semibold">
            Invite To Workspace
          </div>
          <Xbtn size="size-5 md:size-6" onClick={() => setShow(false)}></Xbtn>
        </FlexBtwWrapper>
        <div className="flex  items-center  gap-3 px-4 py-3">
          <div className="w-fit">
            {wData.avatar ? (
              <div className="relative w-11 h-11 lg:w-12 lg:h-12 rounded-lg overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800">
                <Image
                  alt={"projectAvatar"}
                  src={wData.avatar}
                  className="object-center object-cover"
                  fill
                ></Image>
              </div>
            ) : (
              <div
                className={`w-11 h-11 lg:w-12 lg:h-12  rounded-lg  flex justify-center items-center  `}
                style={{ background: gradientBgFromName(wData.name) }}
              >
                <div className="font-semibold text-lg lg:text-xl text-white ">
                  {getInitials(wData.name)}
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="text-base lg:text-lg font-semibold">
              {wData.name}
            </div>
            <div className="flex items-center gap-0.5 xl:gap-1 relative group w-fit">
              {isDark ? (
                <svg
                  className="w-4 h-4 text-gray-800 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-800 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
              <div className="text-gray-600 text-sm dark:text-gray-300 font-semibold">
                {wData.members}
              </div>
              <Toolbar top="-top-6">Members</Toolbar>
            </div>
          </div>
        </div>
        <LinkUsernameToggler active={active} setActive={setActive} />
        <FlexBtwWrapper addOns="mb-1">
          <ExpireAtPicker setExpireAt={setExpireAt} expireAt={expireAt} />
          <div>
            <div className="text-gray-900 dark:text-gray-100  text-sm lg:text-base font-semibold flex items-center gap-2">
              Role
            </div>
            <RolesSelector
              roles={roles}
              setRole={setSelectedRole}
              role={selectedRole}
            />
          </div>
        </FlexBtwWrapper>
        {active === 0 && (
          <LinkInvitation role={selectedRole} expireAt={expireAt} />
        )}
        {active === 1 && (
          <UsernameInvitation role={selectedRole} expireAt={expireAt} />
        )}
      </div>
    </OverlayWrapper>
  );
}
