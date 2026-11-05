"use client";

import Image from "next/image";
import BorderWrapper from "../wrappers/BorderWrapper";
import SubBorderWrapper from "../wrappers/SubBorderWrapper";
import { useState } from "react";
import { DateFormatter3 } from "@/lib/functions/date/DateFormatter3";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import { useTheme } from "next-themes";
import PromiseDD from "../dropdowns/PromiseDD";
import MainBtn from "../btns/MainBtn";
import { createPortal } from "react-dom";
import LogOutWarning from "../warnings/LogOutWarning";
import TwoFaDisable from "../warnings/TwoFaDisable";
import DeleteAccount from "../warnings/DeleteAccount";
import EditProfile from "./EditProfile";
import useMounted from "@/lib/hooks/useMounted";
import { useUserProfile } from "@/lib/queries/user/useUserProfile";
import { Theme } from "@prisma/client";
import Spinner1 from "../loadings/Spinner1";
import { AppearancePreview } from "./AppearancePreview";
import { PencilSvgLight } from "../svg/PencilSvg";
import { AppearanceCreator } from "./AppearanceCreator";

export default function MainArea() {
  const {
    user,
    isLoading,
    toggleMute,
    isTogglingMute,
    toggleTheme,
    isTogglingTheme,
  } = useUserProfile();
  const { setTheme, theme } = useTheme();
  const muteOptions = ["Silent", "Ring"];
  const [mute, setMute] = useState(user?.mute ? "Silent" : "Ring");
  const [twoFa, setTwoFa] = useState(user?.twoFA ?? false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [twofaDisableWarn, setTwofaDisableWarn] = useState(false);
  const [logOutWarning, setLogOutWarning] = useState(false);
  const [deleteAccWarning, setDeleteAccWarning] = useState(false);
  const [showAppearanceEdit, setShowAppearanceEdit] = useState(false);
  const mounted = useMounted();
  if (!user || !mounted) return null;
  const currentTheme =
    theme === "dark" ? "Dark" : theme === "light" ? "Light" : "Default";
  const handleThemeChange = async (item: "Dark" | "Light" | "Default") => {
    if (isTogglingTheme) return;
    const theme =
      item === "Dark" ? "dark" : item === "Light" ? "light" : "system";
    setTheme(theme);
    toggleTheme({ theme: item });
  };
  const handleMuteChange = async (item: string) => {
    if (isTogglingMute) return;
    setMute(item);
    toggleMute();
  };
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner1
          size="size-12 lg:size-16"
          fill="fill-gray-900 dark:fill-gray-100"
          color="text-gray-300 dark:text-blk5"
        />
      </div>
    );
  console.log(user.appearance);
  return (
    <>
      <div className="mt-5 max-w-3xl w-full mx-auto ">
        <BorderWrapper>
          <FlexBtwWrapper addOns="mb-2">
            {" "}
            <div className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 font-semibold  ">
              General
            </div>{" "}
            <MainBtn
              addOns="px-3 py-1.5 flex items-center gap-1.5"
              onClick={() => setShowUserEdit(true)}
            >
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-3 lg:size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>{" "}
              <div>Edit</div>
            </MainBtn>
          </FlexBtwWrapper>
          <SubBorderWrapper>
            <div className="flex gap-5 lg:gap-8 mt-3 ">
              <div className="flex items-center flex-col mt-1">
                <div className=" w-fit h-fit overflow-hidden">
                  {user.avatar ? (
                    <div
                      className="relative w-16 h-16 lg:h-22 lg:w-22 rounded-full overflow-hidden  border-gray-200 dark:border-gray-800"
                      onClick={() => {}}
                    >
                      <Image
                        alt={"projectAvatar"}
                        src={user.avatar}
                        className="object-center object-cover"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={` w-16 h-16 lg:h-22 lg:w-22 rounded-full  flex justify-center items-center  `}
                      style={{ background: gradientBgFromName(user.name) }}
                    >
                      <div className="font-semibold text-3xl text-white ">
                        {getInitials(user.name)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="grid grid-cols-[auto_1fr] gap-x-10 sm:gap-x-15 lg:gap-x-20 lg:text-lg ">
                  <div className="text-gray-700 dark:text-gray-300">Name</div>

                  <div className="break-words overflow-wrap-anywhere">
                    {user.name}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    Username
                  </div>
                  <div className="text-blue-500">{user.username}</div>
                  <div className="text-gray-700 dark:text-gray-300">Email</div>
                  <div>{user.email}</div>

                  <div className="text-gray-700 dark:text-gray-300">
                    Joined At
                  </div>
                  <div> {DateFormatter3(user.createdAt)}</div>
                  <div className="text-gray-700 dark:text-gray-300">
                    Workspaces
                  </div>
                  <div className="flex items-center gap-2">
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
                        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                      />
                    </svg>
                    {user.wsCount}
                  </div>
                </div>
                {user.bio && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 lg:text-lg text-gray-700 dark:text-gray-300  mb-1">
                        <div>Description</div>
                      </div>

                      <div className="rounded-lg bg-gray-100 dark:bg-blk6 p-3 text-gray-600 dark:text-gray-400 text-xs md:text-base  break-words  overflow-wrap-anywhere whitespace-pre-wrap">
                        <div className=" break-words">{user.bio}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </SubBorderWrapper>
        </BorderWrapper>
      </div>
      <div className="mt-5 max-w-3xl w-full mx-auto ">
        <BorderWrapper>
          <FlexBtwWrapper addOns="mb-2">
            <div className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 font-semibold mb-2 ">
              Flowspace Appearance
            </div>
            <button
              type="button"
              aria-label="FlowSpace settings"
              aria-expanded={undefined}
              onClick={() => setShowAppearanceEdit(true)}
              className="flex h-9 px-3 gap-2 items-center justify-center rounded-md border-2 border-slate-500 bg-blk3/95 text-white shadow-[2px_2px_0_#000] hover:border-emerald-300 focus-visible:outline-2 focus-visible:outline-white"
            >
              <PencilSvgLight size="size-3 lg:size-4" /> Edit
            </button>
          </FlexBtwWrapper>

          <SubBorderWrapper>
            <AppearancePreview appearance={user.appearance} />
          </SubBorderWrapper>
        </BorderWrapper>
      </div>
      <div className="mt-5 max-w-3xl w-full mx-auto ">
        <BorderWrapper>
          <div className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 font-semibold mb-2 ">
            Prefrences
          </div>
          <SubBorderWrapper>
            <FlexBtwWrapper>
              <div>Theme</div>
              <PromiseDD
                onClick={handleThemeChange}
                array={Object.values(Theme)}
                current={currentTheme}
              ></PromiseDD>
            </FlexBtwWrapper>
            <FlexBtwWrapper addOns="mt-3">
              <div>Notifications And Calls</div>
              <PromiseDD
                onClick={handleMuteChange}
                array={muteOptions}
                current={mute}
              ></PromiseDD>
            </FlexBtwWrapper>
          </SubBorderWrapper>
        </BorderWrapper>
      </div>
      <div className="mt-5 max-w-3xl w-full mx-auto ">
        <BorderWrapper>
          <div className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 font-semibold mb-2 ">
            Password & Security
          </div>
          <SubBorderWrapper>
            <FlexBtwWrapper>
              <div>Two Factor Authentication (2FA)</div>{" "}
              <button
                className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-md cursor-pointer text-white text-sm lg:text-base font-semibold  ${
                  !twoFa
                    ? " bg-blue-500 hover:bg-blue-400 "
                    : "bg-red-500 hover:bg-red-400 "
                }`}
                onClick={() => {
                  if (twoFa) {
                    setTwofaDisableWarn(true);
                  }
                }}
              >
                {twoFa ? "Disable" : "Enable"}
              </button>
            </FlexBtwWrapper>
          </SubBorderWrapper>
        </BorderWrapper>
      </div>
      <div className="mt-5 max-w-3xl w-full mx-auto ">
        <BorderWrapper>
          <div className="text-lg lg:text-xl text-red-500 font-semibold mb-2 ">
            Danger Zone
          </div>
          <SubBorderWrapper addOns="mt-3">
            <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg ">
              Delete Account
            </div>
            <div className="text-red-400 text-[10px] lg:text-xs mb-2 ">
              This is an irreversible action. Be careful!
            </div>
            <div
              className=" bg-red-500 hover:bg-red-700 cursor-pointer rounded-md px-3 py-1 w-fit text-white"
              onClick={() => setDeleteAccWarning(true)}
            >
              Delete
            </div>
          </SubBorderWrapper>
        </BorderWrapper>{" "}
      </div>
      <div className="flex items-center justify-center mt-5 pb-10">
        <MainBtn
          onClick={() => {
            setLogOutWarning(true);
          }}
          addOns="px-3 py-1.5 lg:px-4 lg:py-2"
        >
          Log Out
        </MainBtn>
      </div>
      {mounted &&
        createPortal(
          <LogOutWarning
            showWarning={logOutWarning}
            setShowWarning={setLogOutWarning}
          />,
          document.body,
        )}
      {mounted &&
        createPortal(
          <TwoFaDisable
            showWarning={twofaDisableWarn}
            setShowWarning={setTwofaDisableWarn}
            handleDisTwoFa={() => {
              setTwoFa((prev) => !prev);
            }}
          />,
          document.body,
        )}
      {mounted &&
        createPortal(
          <DeleteAccount
            show={deleteAccWarning}
            setShow={setDeleteAccWarning}
          />,
          document.body,
        )}
      {mounted &&
        createPortal(
          <EditProfile
            user={user}
            setShow={setShowUserEdit}
            show={showUserEdit}
          />,
          document.body,
        )}
      {mounted &&
        showAppearanceEdit &&
        createPortal(
          <AppearanceCreator
            appearance={user.appearance}
            setShow={setShowAppearanceEdit}
            show={showAppearanceEdit}
          />,
          document.body,
        )}
    </>
  );
}
