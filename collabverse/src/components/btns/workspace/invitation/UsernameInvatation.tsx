import { useState } from "react";
import { wsRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import { useInvitationCreate } from "@/lib/queries/workspace/invitation/useInvitationCreate";
import UserNameValidityCard from "@/components/Profile/UserNameValidityCard";
import Spinner1 from "@/components/loadings/Spinner1";

export default function UsernameInvitation({
  role,
  expireAt,
}: {
  role: wsRoleChange;
  expireAt?: Date;
}) {
  const [username, setUsername] = useState("");
  const [usernameValidity, setUsernameValidity] = useState(true);
  const {
    usernameInvitation: { mutate, isPending },
  } = useInvitationCreate();

  return (
    <>
      {" "}
      <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold flex items-center gap-2 w-full">
        Username
      </div>
      <div className="flex flex-1 items-center  text-sm lg:text-base w-full">
        <UserNameValidityCard
          addons="flex-1"
          setValidity={setUsernameValidity}
          username={username}
          handleUsernameEdit={(n: string) => {
            setUsername(n);
          }}
          inputClass=" aria-invalid:border-red-500  px-3 py-[6.5px] rounded-l-md border-2 border-gray-500 dark:border-gray-500 border-r-0 focus:outline-none  "
        ></UserNameValidityCard>
        <button
          disabled={!usernameValidity || username.trim() === "" || isPending}
          className={`flex items-center justify-center disabled:cursor-not-allowed cursor-pointer text-white h-fit text-nowrap bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl  font-medium rounded-md  text-center transition-all duration-200 w-20 md:w-30 py-[8.5px] md:py-[8px] lg:py-[8.5px] rounded-r-md rounded-l-none`}
          onClick={() => {
            mutate({ username, role, expireAt });
          }}
        >
          {isPending ? (
            <Spinner1
              size="size-5 md:size-6"
              fill="fill-white"
              color="text-blue-300"
            />
          ) : (
            "Send"
          )}
        </button>
      </div>
    </>
  );
}
