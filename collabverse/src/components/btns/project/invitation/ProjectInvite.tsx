import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import useIsDark from "@/lib/hooks/useIsDark";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import Xbtn from "../../Xbtn";
import Toolbar from "@/components/helpers/Toolbar";

export default function ProjectInvite({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  // const [copy, setCopy] = useState(false);
  // const roles = ["Contibutor", "Viewer"];
  // const isDark = useIsDark();
  // if (
  //   pData.currentUserRole === "Manager" ||
  //   pData.currentUserRole === "Owner"
  // ) {
  //   roles.unshift("Manager");
  // }
  // const [activeIdx, setActiveIdx] = useState(0);

  // useEffect(() => {
  //   if (!copy) return;
  //   const timeOut = setTimeout(() => {
  //     setCopy(false);
  //   }, 5000);
  //   return () => clearTimeout(timeOut);
  // }, [copy]);
  // const inviteLink = "https://app.yoursite.com/invite?token=9f3c1e2b7a4d...";
  // return (
  //   <OverlayWrapper active={show}>
  //     <div className="lg:w-sm md:w-xs w-60 text-gray-900 dark:text-gray-100">
  //       <FlexBtwWrapper>
  //         {" "}
  //         <div className="text-gray-900 dark:text-gray-100 text-xl font-semibold">
  //           Invite To Project
  //         </div>
  //         <Xbtn size="size-5 md:size-6" onClick={() => setShow(false)}></Xbtn>
  //       </FlexBtwWrapper>
  //       <div className="flex  items-center  gap-3 px-4 py-3">
  //         <div className="w-fit">
  //           {pData.avatar ? (
  //             <div
  //               className="relative w-12 h-12  rounded-lg overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
  //               onClick={() => {}}
  //             >
  //               <Image
  //                 alt={"projectAvatar"}
  //                 src={pData.avatar}
  //                 className="object-center"
  //                 fill
  //               ></Image>
  //             </div>
  //           ) : (
  //             <div
  //               className={` w-12 h-12  rounded-lg  flex justify-center items-center  `}
  //               style={{ background: gradientBgFromName(pData.name) }}
  //             >
  //               <div className="font-semibold text-xl text-white ">
  //                 {getInitials(pData.name)}
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //         <div>
  //           <div className="text-base lg:text-lg font-semibold">
  //             {pData.name}
  //           </div>
  //           <div className="flex items-center gap-0.5 xl:gap-1 relative group w-fit">
  //             {isDark ? (
  //               <svg
  //                 className="w-4 h-4 text-gray-800 dark:text-gray-400"
  //                 aria-hidden="true"
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 width="24"
  //                 height="24"
  //                 fill="currentColor"
  //                 viewBox="0 0 24 24"
  //               >
  //                 <path
  //                   fillRule="evenodd"
  //                   d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z"
  //                   clipRule="evenodd"
  //                 />
  //               </svg>
  //             ) : (
  //               <svg
  //                 className="w-4 h-4 text-gray-800 dark:text-gray-400"
  //                 aria-hidden="true"
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 width="24"
  //                 height="24"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //               >
  //                 <path
  //                   stroke="currentColor"
  //                   strokeLinecap="round"
  //                   strokeWidth="1.5"
  //                   d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
  //                 />
  //               </svg>
  //             )}
  //             <div className="text-gray-600 text-sm dark:text-gray-300 font-semibold">
  //               {pData.members}
  //             </div>
  //             <Toolbar top="-top-6">Members</Toolbar>
  //           </div>
  //         </div>
  //       </div>
  //       <div className="flex items-center  text-sm lg:text-base ">
  //         <input
  //           type="text"
  //           value={inviteLink}
  //           readOnly
  //           className="px-3 py-1.5 rounded-l-md border-2 border-gray-500 dark:border-gray-300 border-r-0 focus:outline-none w-full text-xs md:text-base"
  //         />
  //         <button
  //           className={`cursor-pointer text-white h-fit text-nowrap bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl  font-medium text-xs md:text-base text-center transition-all duration-200 w-30 py-2 rounded-r-md`}
  //           onClick={() => {
  //             navigator.clipboard.writeText(inviteLink);
  //             setCopy(true);
  //           }}
  //         >
  //           {copy ? "Copied" : "Copy"}
  //         </button>
  //       </div>
  //       <div className="mt-3 flex items-center gap-3">
  //         {roles.map((r: string, idx: number) => (
  //           <div key={idx} className="flex items-center">
  //             <div className="w-fit flex items-center justify-center">
  //               <input
  //                 type="radio"
  //                 name="options"
  //                 checked={activeIdx === idx}
  //                 onChange={() => setActiveIdx(idx)}
  //                 className="
  //                     relative w-4 h-4 rounded-full
  //                     border-2 border-gray-500 dark:border-gray-300
  //                     appearance-none
  //                     cursor-pointer

  //                     checked:border-brand
  //                     checked:bg-brand

  //                     before:content-['']
  //                     before:absolute
  //                     before:top-1/2 before:left-1/2
  //                     before:h-2 before:w-2
  //                     before:-translate-x-1/2 before:-translate-y-1/2
  //                     before:rounded-full
  //                     before:bg-blue-500
  //                     before:scale-0

  //                     checked:before:scale-100
  //                     transition-all
  //                   "
  //               />
  //             </div>
  //             <label className="w-full py-3 select-none ms-2 text-sm font-medium text-heading">
  //               {r}
  //             </label>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </OverlayWrapper>
  // );
  return <div></div>;
}
