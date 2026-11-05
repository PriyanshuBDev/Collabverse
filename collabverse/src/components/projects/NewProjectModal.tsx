import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import ScrollableOverlayWrapper from "../wrappers/ScrollableOverlayWrapper";
import TitleAndElement from "../myTasks/TitleAndElement";
import {
  projectInviteAllowedRoles,
  projectInvitedUser,
} from "../../app/interfaces";
import SearchUsersBar from "./SearchUsersBar";
import PsUserCard, { OwnerCard } from "./PsUserCard";
import "../../app/globals.css";
import "react-day-picker/dist/style.css";
import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { PositionProps } from "../ChatComponents/Bubble";
import NameValidityCard from "../btns/workspace/NameValidityCard";
import AvatarPicker from "../Avatar/AvatarPicker";
import ClickAnywhere from "../dropdowns/ClickAnywhere";
import useMounted from "@/lib/hooks/useMounted";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import Spinner2 from "../loadings/Spinner2";
import { useCreateProject } from "@/lib/queries/workspace/project/useCreateProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useWidthResize } from "@/lib/hooks/useWidthResize";
import DueDate from "../selectors/DueDate";
import { ProjectSvg } from "../svg/ProjectSvg";
import { PencilSvg } from "../svg/PencilSvg";

export default function NewProjectModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const { id } = useCurrentWorkspace();
  const { createProject, isCreating } = useCreateProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState<string | undefined>();
  const [due, setDue] = useState<Date>();
  const [avatar, setAvatar] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const [width, setWidth] = useState(0);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState<projectInvitedUser[]>([]);
  const mounted = useMounted();
  useWidthResize(setWidth);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menuPos) return;

    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!avatar) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(avatar);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url); // prevent memory leaks
  }, [avatar]);
  const disabled = !name || name.length < 6;
  if (!mounted) return null;

  if (isCreating)
    return (
      <OverlayWrapper active addOns="lg:p-8 p-5">
        <Spinner2
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        >
          <ProjectSvg size="size-5 lg:size-7" />
        </Spinner2>
      </OverlayWrapper>
    );
  const close = () => {
    setShow(false);
    setName("");
    setUsers([]);
    setDescription("");
    setDue(undefined);
  };
  const filterByRole = (role: projectInviteAllowedRoles) => {
    return users.filter((u: projectInvitedUser) => u.role === role);
  };
  const managers = filterByRole("Manager");
  const contributors = filterByRole("Contributor");
  const viewers = filterByRole("Viewer");
  return (
    <ScrollableOverlayWrapper active={show}>
      <div
        className={` text-gray-900 dark:text-gray-100 max-w-md lg:max-w-full min-w-xs lg:min-w-md transition-all transform duration-500 flex  ease-in-out items-stretch  overflow-x-hidden`}
      >
        <div
          className={`flex-grow transform duration-500 transition-[max-width,opacity,padding] lg:min-h-140  h-full overflow-hidden ${
            showUsers
              ? "lg:border-r-2 lg:border-gray-200 lg:dark:border-gray-800 lg:pr-5"
              : ""
          }`}
        >
          <div className="text-gray-900 dark:text-gray-100 mb-1 text-xl lg:text-2xl flex items-center gap-2 justify-center font-semibold">
            <ProjectSvg />
            Create Project
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center flex-col justify-center w-full">
              <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold flex items-center gap-1">
                Avatar
              </div>
              <div className="relative w-fit group overflow-hidden">
                {previewUrl ? (
                  <div
                    className="relative w-14 h-14 lg:h-17 lg:w-17 rounded-lg overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                    onClick={() => {}}
                  >
                    <Image
                      alt={"projectAvatar"}
                      src={previewUrl}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : name ? (
                  <div
                    className={` w-14 h-14 lg:h-17 lg:w-17 rounded-lg  flex justify-center items-center  `}
                    style={{ background: gradientBgFromName(name) }}
                  >
                    <div className="font-semibold text-3xl text-white ">
                      {getInitials(name)}
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 lg:h-17 lg:w-17 flex items-center justify-center bg-gray-300 dark:bg-blk6 text-gray-500 rounded-lg border border-gray-400 dark:border-blk9"></div>
                )}
                <div
                  className="z-110 absolute inset-0 flex items-center justify-center group-hover:bg-black/20 rounded-lg cursor-pointer invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300"
                  onClick={handleClick}
                >
                  <div className="bg-gray-500/40 p-3 rounded-full z-111 ">
                    <PencilSvg size="size-4" />
                  </div>
                </div>
              </div>
            </div>
            <TitleAndElement title="Name">
              <NameValidityCard name={name} setName={setName} />
            </TitleAndElement>

            <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold flex items-center gap-2">
              Due Date
              <div className="text-gray-500 font-normal text-xs lg:text-sm">
                (optional)
              </div>
            </div>
            <DueDate due={due} setDue={setDue} />
            <TitleAndElement title="Sent Invitations">
              <SearchUsersBar setUsers={setUsers} users={users} />
            </TitleAndElement>

            <div
              className="text-gray-500 hover:underline text-sm lg:text-base flex items-center gap-1 cursor-pointer"
              onClick={() => setShowUsers((prev) => !prev)}
            >
              Show Users
              <svg
                className={`w-4 h-4  transition-all duration-300  ${
                  showUsers
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
                showUsers && width < 1023
                  ? "opacity-100  max-h-120"
                  : "opacity-0  max-h-0 pointer-events-none m-0 p-0"
              }`}
            >
              <div className="overflow-y-auto overflow-x-hidden max-h-120 thinScrollbar">
                <div>
                  <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                    Owner
                  </div>
                  <div className="mt-2  ">
                    <OwnerCard />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                      Managers
                    </div>
                    <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                      {managers.length}
                    </div>
                  </div>
                  <div className="mt-2  ">
                    {managers.map((a: projectInvitedUser) => (
                      <PsUserCard user={a} key={a.id} setUsers={setUsers} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                      Managers
                    </div>
                    <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                      {managers.length}
                    </div>
                  </div>
                  <div className="mt-2  ">
                    {managers.map((a: projectInvitedUser) => (
                      <PsUserCard user={a} key={a.id} setUsers={setUsers} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                      Contributor
                    </div>
                    <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                      {contributors.length}
                    </div>
                  </div>
                  <div className="mt-2  ">
                    {contributors.map((a: projectInvitedUser) => (
                      <PsUserCard user={a} key={a.id} setUsers={setUsers} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                      Viewers
                    </div>
                    <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                      {viewers.length}
                    </div>
                  </div>
                  <div className="mt-2  ">
                    {viewers.map((a: projectInvitedUser) => (
                      <PsUserCard user={a} key={a.id} setUsers={setUsers} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-gray-900 dark:text-gray-100  text-sm lg:text-base font-semibold">
                  Description
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                  ({description?.length ?? 0} / 1000)
                </div>
              </div>
              <textarea
                maxLength={1000}
                value={description}
                placeholder="Enter description"
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setDescription(e.target.value);
                  const target = e.target;
                  target.style.height = "auto"; // reset height
                  target.style.height = target.scrollHeight + "px";
                }}
                className="resize-none overflow-hidden  max-h-30 overflow-y-auto w-full rounded-md placeholder:font-semibold bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 transition-all duration-300 px-3 py-1 text-sm lg:text-base"
              />
            </div>

            <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5 ">
              <button
                className={`px-2 lg:px-3 py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
                onClick={close}
              >
                cancel
              </button>
              <button
                disabled={disabled}
                className={`px-2 lg:px-3 py-1 lg:py-1 bg-blue-500 hover:bg-blue-400 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:dark:bg-gray-700`}
                onClick={() => {
                  createProject({
                    workspaceId: id,
                    name,
                    avatar: avatar,
                    description,
                    dueDate: due,
                    users,
                  });
                  setName("");
                  setDue(undefined);
                  setDescription(undefined);
                  setAvatar(undefined);
                  setShow(false);
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>

        <div
          className={`h-full transform duration-500 flex flex-col max-h-140  min-w-0 transition-[max-width,opacity,padding] overflow-x-hidden ${
            showUsers && width > 1024
              ? "max-w-lg opacity-100 pl-5 border-opacity-100"
              : "max-w-0 opacity-0 pl-0 pr-0 ml-0 py-0 border-opacity-0"
          }`}
          style={{
            height: "100%",
            alignSelf: "stretch",
          }}
        >
          <div
            className="text-gray-500 flex justify-end w-full cursor-pointer "
            onClick={() => setShowUsers(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="overflow-y-auto overflow-x-hidden h-130 thinScrollbar">
            <div>
              <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                Owner
              </div>
              <div className="mt-2  ">
                <OwnerCard />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                  Managers
                </div>
                <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                  {managers.length}
                </div>
              </div>
              <div className="mt-2   ">
                {managers.map((a: projectInvitedUser) => (
                  <PsUserCard user={a} key={a.id} setUsers={setUsers} />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                  Contributors
                </div>
                <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                  {contributors.length}
                </div>
              </div>
              <div className="mt-2">
                {contributors.map((a: projectInvitedUser) => (
                  <PsUserCard user={a} key={a.id} setUsers={setUsers} />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                  Viewers
                </div>
                <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                  {viewers.length}
                </div>
              </div>
              <div className="mt-2   ">
                {viewers.map((a: projectInvitedUser) => (
                  <PsUserCard user={a} key={a.id} setUsers={setUsers} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ClickAnywhere setMenuPos={setMenuPos} menuPos={menuPos} width="w-35">
        <ul>
          <li
            className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
            onClick={() => {
              avatarInputRef.current?.click();
              setMenuPos(null);
            }}
          >
            Change
          </li>
          {avatar && previewUrl && (
            <li
              className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
              onClick={() => {
                setAvatar(undefined);
                setMenuPos(null);
              }}
            >
              Remove
            </li>
          )}
        </ul>
      </ClickAnywhere>
      <AvatarPicker
        avatarInputRef={avatarInputRef}
        setSelected={setAvatar}
      ></AvatarPicker>
    </ScrollableOverlayWrapper>
  );
}
