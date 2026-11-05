import { Dispatch, SetStateAction, useEffect, useState } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import { UserDeleteAccountProps } from "@/app/interfaces";
import Xbtn from "../btns/Xbtn";
import { toast } from "sonner";
import axios, { isAxiosError } from "axios";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import PasswordCheckInput from "./PasswordCheckInput";
import Spinner2 from "../loadings/Spinner2";
import useMounted from "@/lib/hooks/useMounted";
import useIsDark from "@/lib/hooks/useIsDark";

export default function DeleteAccount({
  setShow,
  show,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  show: boolean;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [data, setData] = useState<UserDeleteAccountProps>();
  const [verfied, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDark = useIsDark();
  const mounted = useMounted();

  useEffect(() => {
    if (!show) return;
    async function getDeleteAccount() {
      try {
        const res = await axios.get<UserDeleteAccountProps>(
          "/api/user/delete/details",
        );
        setData(res.data);
      } catch {
        toast.error("Something went wrong");
      }
    }
    getDeleteAccount();
  }, [show]);
  if (!data || !mounted) return null;
  const isNotOwner = data.projCount < 1 && data.wsCount < 1;

  const handleDeleting = async () => {
    if (!verfied) return;
    setLoading(true);
    const supabase = supabaseBrowser();
    try {
      await axios.delete("/api/user/delete");
      await supabase.auth.signOut();
      queryClient.clear();
      sessionStorage.clear();
      localStorage.clear();
      setLoading(false);
      router.replace("/auth/signup");
    } catch (e) {
      if (isAxiosError(e)) {
        switch (e.status) {
          case 403: {
            toast.error("Password verification required");
            break;
          }
          case 409: {
            toast.error("Transfer ownership before deleting account");
            break;
          }
          default: {
            toast.error("Something went wrong");
          }
        }
      } else {
        toast.error("Something went wrong");
      }
      setLoading(false);
    }
  };
  if (loading)
    return (
      <OverlayWrapper active={loading && show} addOns="lg:p-8 p-5">
        <Spinner2
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        >
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 lg:size-7"
            >
              <path
                fillRule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5 lg:size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          )}
        </Spinner2>
      </OverlayWrapper>
    );

  return (
    <OverlayWrapper active={show} addOns="lg:w-md">
      {isNotOwner ? (
        <>
          <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md ">
            Are you sure about deleting your account?
          </div>
          <div className="text-xs lg:text-sm text-red-500">
            Deleting account is permanent. All your workspace, projects, files,
            etc will be lost.
          </div>
          <div className="text-sm lg:text-base text-gray-700 dark:text-gray-400 flex flex-wrap max-w-sm lg:max-w-md mt-3">
            Enter your password to verify it&apos;s you.
          </div>
          <PasswordCheckInput setIsVerified={setVerified} email={data.email} />

          <div className={`flex items-center justify-end gap-2 lg:gap-3 `}>
            <button
              className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
              onClick={() => {
                setShow(false);
                setVerified(false);
                setLoading(false);
              }}
            >
              cancel
            </button>

            <button
              disabled={!verfied}
              className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-md text-sm lg:text-base font-semibold  ${
                verfied
                  ? "text-white bg-red-500 hover:bg-red-400 cursor-pointer"
                  : "text-gray-800 bg-gray-300 dark:text-gray-600 dark:bg-blk7 cursor-not-allowed"
              }`}
              onClick={() => {
                handleDeleting();
              }}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <div className="flex">
          <div>
            <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md ">
              You can&apos;t delete your account as you are owner of{" "}
              {data.wsCount > 0
                ? `${data.wsCount} workspace${data.wsCount > 1 ? "s" : ""}`
                : ""}
              {data.wsCount > 0 && data.projCount > 0 ? " and " : ""}
              {data.projCount > 0
                ? `${data.projCount} project${data.projCount > 1 ? "s" : ""}`
                : ""}
              .
            </div>
            <div className="text-xs lg:text-sm text-red-500">
              Transfer Ownership before deleting your account.
            </div>
          </div>
          <Xbtn
            onClick={() => {
              setShow(false);
              setVerified(false);
              setLoading(false);
            }}
            size="size-5 lg:size-6"
          ></Xbtn>
        </div>
      )}
    </OverlayWrapper>
  );
}
