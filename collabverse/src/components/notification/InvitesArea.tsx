import { useInvitations } from "@/lib/queries/user/invitation/useInvitations";
import Spinner1 from "../loadings/Spinner1";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import InvitationCard from "./InvitationCard";
import { userInvitationsProps } from "@/app/interfaces";

export default function InvitesArea() {
  const { data, isLoading, isError, error } = useInvitations();
  useIsErrorToast(isError, "Failed to fetch invitations", error);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full ">
        <Spinner1 size="size-10 lg:size-14"></Spinner1>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center text-xs sm:text-base lg:text-xl">
          No new invitations
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 max-w-2xl w-full mx-auto flex flex-col items-center gap-1 lg:gap-2 pb-10">
      {data.map((i: userInvitationsProps) => (
        <InvitationCard key={i.id} i={i} />
      ))}
    </div>
  );
}
