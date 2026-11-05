import GroupMembers from "./GroupMembers";
import GroupPermissions from "./GroupPermissions";
import Xbtn from "@/components/btns/Xbtn";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import GroupOverview from "./GroupOverview";
import { useGroupData } from "@/lib/queries/workspace/conversation/group/useGroupData";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Spinner1 from "@/components/loadings/Spinner1";
import { getTotalMembersCount } from "@/lib/axios/workspace/conversation/group/getTotalMembersCount";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import GroupDeleteWarning from "@/components/warnings/GroupDeleteWarning";
import AutoDeleteWarning from "@/components/warnings/AutoDeleteWarning";
import { useClearMessages } from "@/lib/queries/workspace/conversation/messages/useClearMessages";
import { toast } from "sonner";
import { GroupLeaveWarning } from "@/components/warnings/GroupLeaveWarning";
import { ConvoClearMsgWarning } from "@/components/warnings/ConvoClearMsgWarning";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";

export default function GroupDetailsArea({
  show,
  setShow,
  setIsHeaderLoading,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  setIsHeaderLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: conversationId } = useCurrentConversation();
  const [showMute, setShowMute] = useState(false);
  const [leaveWarn, setLeaveWarn] = useState(false);
  const [clearWarn, setClearWarn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(`groupTab-1`);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [deleteWarn, setDeleteWarn] = useState(false);
  const [autoDeleteWarn, setAutoDeleteWarn] = useState(false);
  const { data, isLoading, isError, error, leave, deleteGroupMutate } =
    useGroupData(conversationId);
  const { mutate: clearFn, isPending: isClearing } = useClearMessages();
  useIsErrorToast(isError, "Failed to fetch group data", error);
  const ref = useRef<HTMLDivElement>(null);
  const closeUser = () => {
    if (leaveWarn || clearWarn) return;
    setActiveIndex("groupTab-1");
    setShowAddMembers(false);
    setShow(false);
  };
  useEffect(() => {
    if (isLoading) {
      setIsHeaderLoading(true);
    } else {
      setIsHeaderLoading(false);
    }
  }, [isLoading, setIsHeaderLoading]);
  let isLast = false;
  const handleLeaveValidation = async () => {
    try {
      const usersLength = await getTotalMembersCount({
        workspaceId,
        conversationId,
      });
      if (usersLength === 1) {
        isLast = true;
      }
    } catch (e) {
      console.error(e);
      toast.error(`Something went wrong. Please try leaving the group later`);
    }
  };
  if (deleteGroupMutate.isPending || leave.isPending || isClearing) {
    return (
      <div
        className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 visible`}
      >
        <Spinner1
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        ></Spinner1>
      </div>
    );
  }

  if (!data) return null;
  return (
    <>
      {" "}
      <div
        className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 ${
          show ? "visible" : "invisible pointer-events-none"
        }`}
      >
        <div
          ref={ref}
          className={`min-h-110 transition-all duration-300 bg-gray-50 dark:bg-blk4 shadow-md rounded-xl z-1001 p-2 grid grid-cols-6 w-md lg:w-lg ${
            show ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
            e.stopPropagation()
          }
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-xl rounded-full lg:p-2 p-1">
                <Spinner1 size="size-8 lg:size-10" />
              </div>
            </div>
          ) : (
            <>
              <div className="col-span-2 flex flex-col gap-2 text-gray-900 dark:text-gray-100  pr-2">
                <div
                  className={`cursor-pointer px-3 py-1 flex items-center gap-2 text-sm lg:text-base hover:bg-gray-200 dark:hover:bg-blk7 rounded-lg ${
                    activeIndex === "groupTab-1"
                      ? "bg-gray-200 dark:bg-blk7 border-l-3 border-emerald-500 "
                      : ""
                  }`}
                  onClick={() => {
                    setActiveIndex("groupTab-1");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4 lg:size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                  Overview
                </div>
                <div
                  className={`cursor-pointer px-3 py-1 flex items-center gap-2 text-sm lg:text-base hover:bg-gray-200 dark:hover:bg-blk7 rounded-lg ${
                    activeIndex === "groupTab-2"
                      ? "bg-gray-200 dark:bg-blk7 border-l-3 border-emerald-500 "
                      : ""
                  }`}
                  onClick={() => {
                    setActiveIndex("groupTab-2");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4 lg:size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                  Members
                </div>
                <div
                  className={`cursor-pointer px-3 py-1 flex items-center gap-2 text-sm lg:text-base hover:bg-gray-200 dark:hover:bg-blk7 rounded-lg ${
                    activeIndex === "groupTab-3"
                      ? "bg-gray-200 dark:bg-blk7 border-l-3 border-emerald-500 "
                      : ""
                  }`}
                  onClick={() => {
                    setActiveIndex("groupTab-3");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4 lg:size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  Permission
                </div>
              </div>
              <div className="col-span-4 pl-2 border-l border-gray-300 dark:border-gray-600">
                <div className="flex justify-end w-full">
                  <Xbtn
                    onClick={() => {
                      setShow(false);
                    }}
                  />
                </div>
                {activeIndex === "groupTab-1" && (
                  <>
                    <GroupOverview
                      data={data}
                      open={show}
                      closeGroup={closeUser}
                      setShowMute={setShowMute}
                      showMute={showMute}
                    />
                    <div
                      className="  text-gray-900 dark:text-gray-100 py-1 px-3 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-1"
                      onClick={() => {
                        setClearWarn(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-eraser"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z" />
                      </svg>
                      Clear chat
                    </div>
                    <div
                      className="text-red-500 py-1 px-3 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-1"
                      onClick={async (
                        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
                      ) => {
                        e.stopPropagation();
                        setLeaveWarn(true);
                        await handleLeaveValidation();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                        />
                      </svg>
                      Leave
                    </div>
                  </>
                )}
                {activeIndex === "groupTab-2" && (
                  <GroupMembers
                    groupData={data}
                    setShowAddMembers={setShowAddMembers}
                    showAddMembers={showAddMembers}
                  />
                )}
                {activeIndex === "groupTab-3" && (
                  <GroupPermissions
                    currentUserRole={data.currentUserRole}
                    data={data}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <ConvoClearMsgWarning
        setShow={setClearWarn}
        show={clearWarn}
        handleClearing={() => clearFn()}
        name={data.name}
        avatar={data.avatar}
        type={"Group"}
        closeMenu={() => {}}
      />
      <GroupLeaveWarning
        setAutoDeleteWarn={setAutoDeleteWarn}
        setShow={setLeaveWarn}
        show={leaveWarn}
        name={data.name}
        avatar={data.avatar}
        handleLeaving={() => leave.mutate({ name: data.name })}
        isLast={isLast}
        closeMenu={() => {}}
      />
      <GroupDeleteWarning
        setShow={setDeleteWarn}
        show={deleteWarn}
        handleDeleting={() => deleteGroupMutate.mutate({ name: data.name })}
        data={data}
      />
      <AutoDeleteWarning
        setShow={setAutoDeleteWarn}
        show={autoDeleteWarn}
        leaveGroup={() => leave.mutate({ name: data.name })}
        closeMenu={() => {}}
      />
    </>
  );
}
