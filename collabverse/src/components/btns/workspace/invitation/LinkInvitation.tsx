import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { useEffect, useRef, useState } from "react";
import { useInvitationCreate } from "@/lib/queries/workspace/invitation/useInvitationCreate";
import { wsRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import MainBtn from "../../MainBtn";
import Spinner1 from "@/components/loadings/Spinner1";

export default function LinkInvitation({
  role,
  expireAt,
}: {
  role: wsRoleChange;
  expireAt?: Date;
}) {
  const maxUsesOptions = [1, 5, 10, 20, 50];
  const [maxUses, setMaxUses] = useState<number>(5);
  const {
    linkInvitation: { data, isPending, mutate },
  } = useInvitationCreate();
  const [showMaxUses, setShowMaxUses] = useState(false);
  const maxUsesDropRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([maxUsesDropRef], () => setShowMaxUses(false));
  const [copy, setCopy] = useState(false);
  useEffect(() => {
    if (!copy) return;
    const timeOut = setTimeout(() => {
      setCopy(false);
    }, 5000);
    return () => clearTimeout(timeOut);
  }, [copy]);

  return (
    <>
      <div className="flex justify-between mb-2 items-end">
        <div>
          <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold flex items-center gap-2">
            Max Uses
          </div>
          <div
            ref={maxUsesDropRef}
            className={`relative lg:min-w-25 min-w-20 text-nowrap  `}
          >
            <div
              className={` text-black dark:text-gray-100  cursor-pointer justify-between flex gap-2 items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none  font-semibold text-sm rounded-md lg:px-3 px-2 lg:py-1.5 py-1 `}
              onClick={() => {
                setShowMaxUses((prev) => !prev);
              }}
            >
              {maxUses}
              <div className="text-gray-500 pr-1 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="size-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>
            <div
              className={`max-h-70 overflow-y-auto z-30 shadow-lg absolute top-11 lg:top-12 left-1/2 -translate-x-1/2 w-max min-w-full bg-gray-200 divide-y transition-all duration-300 divide-gray-100 rounded-lg dark:bg-blk5 ${
                showMaxUses
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-10 invisible pointer-events-none"
              }`}
            >
              <ul
                className="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownDefaultButton"
              >
                {maxUsesOptions.map((o: number, idx: number) => {
                  return (
                    <li key={idx}>
                      <div
                        className=" block lg:text text-xs lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white break-words overflow-wrap-anywhere"
                        onClick={() => {
                          setShowMaxUses(false);
                          setMaxUses(o);
                        }}
                      >
                        {o}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>{" "}
        </div>
        <MainBtn
          onClick={() => {
            mutate({ role, maxUses, expireAt });
          }}
          addOns="px-3 py-1"
        >
          Generate
        </MainBtn>
      </div>
      {isPending ? (
        <div className={` flex items-center justify-center w-full py-1`}>
          <Spinner1
            fill="fill-gray-800 dark:fill-gray-200"
            size="size-6 lg:size-8"
            color="text-gray-200 dark:text-blk3"
          ></Spinner1>
        </div>
      ) : (
        <div className="flex items-center  text-sm md:text-base ">
          <input
            type="text"
            value={data}
            readOnly
            placeholder="Tap generate to get open link"
            className="px-3 py-[6.5px] rounded-l-md border-2 border-gray-500 dark:border-gray-500 border-r-0 focus:outline-none w-full "
          />
          <button
            disabled={data?.trim() === ""}
            className={`disabled:cursor-not-allowed cursor-pointer text-white h-fit text-nowrap bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl  font-medium rounded-md  text-center transition-all duration-200 w-20 md:w-30 py-[8px] lg:py-[8.5px] rounded-r-md rounded-l-none`}
            onClick={() => {
              navigator.clipboard.writeText(data ?? "");
              setCopy(true);
            }}
          >
            {copy ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </>
  );
}
