import { userCommonGroups, userCommonProjectProps } from "@/app/interfaces";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import Xbtn from "../btns/Xbtn";
import Toolbar from "../helpers/Toolbar";
import htmlToText from "@/lib/functions/chat/htmlToText";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useUserStatus } from "@/lib/hooks/conversation/useUserStatus";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useCallStore } from "@/lib/hooks/zustand/useCallStore";
import { VoiceCallSvg } from "@/components/svg/VoiceCallSvg";
import { VideoCallSvg } from "@/components/svg/VideoCallSvg";
import { useCallContext } from "@/components/wrappers/CallProvider";
import { useFullUserDetails } from "@/lib/queries/workspace/users/useFullUserDetails";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import Spinner2 from "@/components/loadings/Spinner2";
import SubBorderWrapper from "@/components/wrappers/SubBorderWrapper";
import { AppearancePreview } from "@/components/Profile/AppearancePreview";
import { useCreateNewDm } from "@/lib/queries/workspace/conversation/dm/new/useCreateNewDm";
import Spinner1 from "../loadings/Spinner1";
import { useRouter } from "next/navigation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { UserSvg } from "../svg/UserSvg";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function CompleteUserCard({ userId }: { userId: string }) {
  const { data, isLoading, isError, error } = useFullUserDetails(userId);
  const { mutateAsync: createConvo, isPending } = useCreateNewDm(false);
  const { isOnline, lastSeenAt } = useUserStatus({
    userId: data?.id,
    lastSeenAt: data?.lastSeenAt ?? null,
  });
  const router = useRouter();
  const { slug } = useCurrentWorkspace();
  const { startCall } = useCallContext();
  const { active } = useCallStore();
  const [showProjects, setShowProjects] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const setUserId = useShowUserStore((s) => s.setUserId);
  useIsErrorToast(isError, "Failed to fetch user data", error);
  if (isLoading)
    return (
      <OverlayWrapper active addOns="lg:p-8 p-5">
        <Spinner2
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        >
          <UserSvg size="size-5 lg:size-7"></UserSvg>
        </Spinner2>
      </OverlayWrapper>
    );
  if (isPending) {
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
      {createPortal(
        <div
          className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 ${
            userId ? "visible" : "invisible pointer-events-none"
          }`}
        >
          <div
            className={`transition-all duration-300 bg-gray-50 dark:bg-blk4 shadow-md rounded-xl z-1001 p-2 ${
              userId ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end w-full">
              <Xbtn
                onClick={() => {
                  setUserId(null);
                }}
              />
            </div>
            <div className="px-3 pb-3 flex flex-col items-center justify-center">
              <div className="w-fit ">
                {data.avatar ? (
                  <div
                    className="relative lg:w-20 lg:h-20 w-15 h-15 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                    onClick={() => {}}
                  >
                    <Image
                      alt={"UserAvatar"}
                      src={data.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={`lg:w-20 lg:h-20 w-15 h-15 rounded-full flex justify-center items-center cursor-pointer`}
                    style={{ background: gradientBgFromName(data.name) }}
                    onClick={() => {}}
                  >
                    <div className="font-semibold text-2xl lg:text-3xl text-white">
                      {getInitials(data.name)}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-gray-900 dark:text-gray-100 font-semibold">
                {data.name}
              </div>
              <div
                className={`
                text-gray-600 dark:text-gray-400 text-sm transition-all duration-300
                ${isOnline || lastSeenAt ? "opacity-100 max-h-6" : "opacity-0 max-h-0"}
              `}
              >
                {isOnline
                  ? "Online"
                  : lastSeenAt
                    ? `Last seen at ${formatDistanceToNow(lastSeenAt)}`
                    : ""}
              </div>
            </div>
            <div className="flex items-center mt-2 gap-3 px-3 justify-center">
              <BtnWrapper
                onClick={async () => {
                  const conversationId = await createConvo(userId);
                  router.push(`/app/${slug}/conversation/${conversationId}`);
                }}
              >
                <div className="text-gray-900 text-[10px] dark:text-gray-100 flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Message
                </div>
              </BtnWrapper>

              <BtnWrapper
                disable={active}
                onClick={() => {
                  startCall(data, "Voice", "Workspace");
                }}
              >
                <div className="text-gray-900 text-[10px] dark:text-gray-100 flex flex-col items-center">
                  <VoiceCallSvg />
                  Voice
                </div>
              </BtnWrapper>
              <BtnWrapper
                disable={active}
                onClick={() => {
                  startCall(data, "Video", "Workspace");
                }}
              >
                <div className="text-gray-900 text-[10px] dark:text-gray-100 flex flex-col items-center">
                  <VideoCallSvg />
                  Video
                </div>
              </BtnWrapper>
            </div>
            <div className="border-y border-gray-200 dark:border-gray-700 mt-2 px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  {" "}
                  <div className="text-blue-500 ">{data.username}</div>
                  <div className="text-xs text-gray-500">Username</div>
                </div>
                <div
                  className="text-gray-500 group relative cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(htmlToText(data.username));
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                    />
                  </svg>
                  <Toolbar top={"-top-7"}>Copy</Toolbar>
                </div>
              </div>
            </div>
            <SubBorderWrapper>
              <AppearancePreview appearance={data.appearance} />
            </SubBorderWrapper>
            <div className="px-3 py-2">
              <div
                className="text-gray-800 hover:underline dark:text-gray-200 text-sm font-semibold flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  setShowProjects((prev) => !prev);
                  setShowGroups(false);
                }}
              >
                Common Projects
                <svg
                  className={`w-5 h-5  transition-all duration-300  ${
                    showProjects
                      ? "rotate-180 lg:rotate-90"
                      : "rotate-0 lg:rotate-270"
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                id="dropdown"
                className={` z-20  overflow-hidden  w-full transform transition-all duration-300 flex flex-col gap-1 ${
                  showProjects
                    ? "opacity-100  max-h-120 mt-3"
                    : "opacity-0  max-h-0 pointer-events-none m-0 p-0 "
                }`}
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-120 thinScrollbar">
                  {data.projects.length > 0 ? (
                    <div
                      className="flex gap-2 flex-col max-h-30 overflow-y-auto overflow-x-hidden text-gray-900 dark:text-gray-100"
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      {data.projects.map((p: userCommonProjectProps) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-4 hover:bg-gray-300 hover:dark:bg-blk7"
                          onClick={() => {
                            router.push(`/app/${slug}/projects/${p.slug}`);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-fit ">
                              {p.avatar ? (
                                <div
                                  className="relative w-6 h-6 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                                  onClick={() => {}}
                                >
                                  <Image
                                    alt={"projectAvatar"}
                                    src={p.avatar}
                                    className="object-center object-cover"
                                    fill
                                  ></Image>
                                </div>
                              ) : (
                                <div
                                  className={`w-6 h-6 rounded-full flex justify-center items-center cursor-pointer `}
                                  style={{
                                    background: gradientBgFromName(p.name),
                                  }}
                                  onClick={() => {}}
                                >
                                  <div className="font-semibold text-xs text-white">
                                    {getInitials(p.name)}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-gray-900 dark:text-gray-100 text-xs font-semibold cursor-pointer hover:underline">
                              {p.name}
                            </div>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 text-xs">
                            {p.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center justify-center text-sm ">
                      No common Projects
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-3 py-2">
              <div
                className="text-gray-800 hover:underline dark:text-gray-200 text-sm font-semibold flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  setShowGroups((prev) => !prev);
                  setShowProjects(false);
                }}
              >
                Common Groups
                <svg
                  className={`w-5 h-5  transition-all duration-300  ${
                    showGroups
                      ? "rotate-180 lg:rotate-90"
                      : "rotate-0 lg:rotate-270"
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                id="dropdown"
                className={` z-20 overflow-hidden  w-full transform transition-all duration-300 flex flex-col gap-1 ${
                  showGroups
                    ? "opacity-100  max-h-120 mt-3"
                    : "opacity-0  max-h-0 pointer-events-none m-0 p-0"
                }`}
              >
                <div className="overflow-y-auto overflow-x-hidden max-h-120 thinScrollbar">
                  {data.groups.length > 0 ? (
                    <div
                      className="flex gap-2 flex-col max-h-30 overflow-y-auto overflow-x-hidden text-gray-900 dark:text-gray-100"
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      {data.groups.map((g: userCommonGroups) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between gap-4 hover:bg-gray-300 hover:dark:bg-blk7"
                          onClick={() => {
                            router.push(`/app/${slug}/conversation/${g.id}`);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-fit ">
                              {g.avatar ? (
                                <div
                                  className="relative w-6 h-6 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                                  onClick={() => {}}
                                >
                                  <Image
                                    alt={"projectAvatar"}
                                    src={g.avatar}
                                    className="object-center object-cover"
                                    fill
                                  ></Image>
                                </div>
                              ) : (
                                <div
                                  className={`w-6 h-6 rounded-full flex justify-center items-center cursor-pointer `}
                                  style={{
                                    background: gradientBgFromName(g.name),
                                  }}
                                  onClick={() => {}}
                                >
                                  <div className="font-semibold text-xs text-white">
                                    {getInitials(g.name)}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-gray-900 dark:text-gray-100 text-xs font-semibold cursor-pointer hover:underline">
                              {g.name}
                            </div>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 text-xs">
                            {g.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center justify-center text-sm ">
                      No common Groups
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export function BtnWrapper({
  children,
  onClick,
  addOns,
  disable,
}: {
  children: ReactNode;
  onClick: () => void;
  addOns?: string;
  disable?: boolean;
}) {
  return (
    <div
      className={`bg-gray-200 dark:bg-blk6 rounded-lg w-18 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-blk8 ${addOns} aria-disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none `}
      aria-disabled={disable}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
