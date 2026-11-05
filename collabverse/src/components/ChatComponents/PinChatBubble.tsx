// import Image from "next/image";
// import { commentReactionProps, taskCommentProps } from "../../app/interfaces";
// import getInitials from "@/lib/functions/user/getInitials";
// import colorFromName from "@/lib/functions/colors/colorFromName";
// import customColorFromName from "@/lib/functions/colors/customColorFromName";
// import { format } from "date-fns";
// import React, {
//   Dispatch,
//   SetStateAction,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import htmlToText from "@/lib/functions/chat/htmlToText";
// import { useTheme } from "next-themes";
// import { getSafeHtml } from "@/lib/functions/chat/getSafeHtml";
// export default function PinChatBubble({
//   comment,
//   handleScrollTo,
//   setShowDrop,
// }: {
//   comment: taskCommentProps;
//   handleScrollTo: (target: string) => void;
//   setShowDrop: Dispatch<SetStateAction<boolean>>;
// }) {
//   const [replyTo, setReplyTo] = useState("");
//   const [mounted, setMounted] = useState(false);
//   const { resolvedTheme } = useTheme();
//   useEffect(() => {
//     setMounted(true);
//   }, []);
//   const parsedHtml = useMemo(
//     () => ({
//       __html: getSafeHtml(comment.comment),
//     }),
//     [comment.comment],
//   );

//   useEffect(() => {
//     if (!comment.replyTo?.comment) return;
//     const text = htmlToText(comment.replyTo?.comment);
//     setReplyTo(text);
//   }, [comment]);

//   // useEffect(() => {
//   //   function handleClickOutside(e: MouseEvent) {
//   //     if (
//   //       pickerRef.current &&
//   //       !pickerRef.current.contains(e.target as Node) &&
//   //       emojiBtnRef.current &&
//   //       !emojiBtnRef.current.contains(e.target as Node)
//   //     ) {
//   //       setShowEmojiPicker(false);
//   //     }
//   //   }

//   //   document.addEventListener("mousedown", handleClickOutside);
//   //   return () => document.removeEventListener("mousedown", handleClickOutside);
//   // }, []);
//   if (!mounted) {
//     return null;
//   }

//   return (
//     <div
//       className={`group flex gap-2 p-1 md:p-2 rounded-md transition-all duration-300 `}
//       id={`pinned-${comment.id}`}
//     >
//       <div className={`mt-1`}>
//         {comment.commentedBy.avatar ? (
//           <div
//             className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
//             onClick={() => {}}
//           >
//             <Image
//               alt={"UserAvatar"}
//               src={comment.commentedBy.avatar}
//               className="object-center"
//               fill
//             ></Image>
//           </div>
//         ) : (
//           <div
//             className={`w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center cursor-pointer ${colorFromName(
//               comment.commentedBy.name,
//             )}`}
//             onClick={() => {}}
//           >
//             <div className="font-semibold text-xs text-white">
//               {getInitials(comment.commentedBy.name)}
//             </div>
//           </div>
//         )}
//       </div>
//       <div className="flex flex-col gap-1">
//         <div className="flex items-center gap-2">
//           <div
//             className="text-gray-800 dark:text-gray-200 text-sm md:text-base font-semibold hover:underline cursor-pointer"
//             onClick={() => {}}
//           >
//             {comment.commentedBy.name}
//           </div>
//           <div className="text-gray-500 text-[10px] md:text-xs">
//             {format(comment.createdAt, "hh:mm a")}
//           </div>
//           <span className=" text-gray-500 lg:pr-2 pr-1 flex items-center gap-1 text-xs">
//             {resolvedTheme === "dark" ? (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="15"
//                 height="15"
//                 fill="currentColor"
//                 className="rotate-45"
//                 viewBox="0 0 16 16"
//               >
//                 <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354" />
//               </svg>
//             ) : (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="15"
//                 height="15"
//                 fill="currentColor"
//                 className="rotate-45"
//                 viewBox="0 0 16 16"
//               >
//                 <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354m1.58 1.408-.002-.001zm-.002-.001.002.001A.5.5 0 0 1 6 2v5a.5.5 0 0 1-.276.447h-.002l-.012.007-.054.03a5 5 0 0 0-.827.58c-.318.278-.585.596-.725.936h7.792c-.14-.34-.407-.658-.725-.936a5 5 0 0 0-.881-.61l-.012-.006h-.002A.5.5 0 0 1 10 7V2a.5.5 0 0 1 .295-.458 1.8 1.8 0 0 0 .351-.271c.08-.08.155-.17.214-.271H5.14q.091.15.214.271a1.8 1.8 0 0 0 .37.282" />
//               </svg>
//             )}
//             {comment.pinIdx}
//           </span>
//         </div>
//         <div className="flex gap-1">
//           <div
//             className={`transfrom duration-300 max-w-68 rounded-lg rounded-tl-none p-3 bg-gray-100 dark:bg-blk5  text-gray-600 dark:text-gray-400 text-xs md:text-sm  break-words overflow-wrap-anywhere `}
//           >
//             {comment.replyTo && (
//               <div
//                 className={` rounded-lg border-l-4 border-2 px-1 py-0.5 cursor-pointer ${customColorFromName(
//                   comment.replyTo.commentedBy.name,
//                   "border",
//                 )} `}
//               >
//                 <div
//                   className={`text-xs md:text-sm font-semibold ${customColorFromName(
//                     comment.replyTo.commentedBy.name,
//                     "text",
//                   )}`}
//                 >
//                   {comment.replyTo?.commentedBy.name}
//                 </div>
//                 <div className="text-xs break-words overflow-wrap-anywhere">
//                   {replyTo.length > 40 ? `${replyTo.slice(0, 40)}...` : replyTo}
//                 </div>
//               </div>
//             )}
//             <div
//               className="prose dark:prose-invert"
//               dangerouslySetInnerHTML={parsedHtml}
//             />
//             {comment.reactions && (
//               <div className="flex items-center flex-wrap gap-1 max-w-60">
//                 {comment.reactions.map(
//                   (r: commentReactionProps, idx: number) => (
//                     <div
//                       key={idx}
//                       className="bg-gray-300 dark:bg-blk7 flex items-center gap-1 px-1 py-0.5 rounded-full mt-2 "
//                     >
//                       <div className="text-xs">{r.emoji}</div>
//                       <div className="text-gray-700 dark:text-gray-300 text-xs">
//                         {r.count}
//                       </div>
//                     </div>
//                   ),
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <div
//         className="flex items-end ml-2 "
//         onClick={() => {
//           handleScrollTo(comment.id);
//           setShowDrop(false);
//         }}
//       >
//         <div className="relative bg-gray-400 dark:bg-blk6 px-1 py-1 rounded-full cursor-pointer">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             fill="currentColor"
//             className="size-5 text-white dark:text-gray-200"
//           >
//             <path
//               fillRule="evenodd"
//               d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.916.455-5.922.505a.39.39 0 0 0-.266.112L8.78 21.53A.75.75 0 0 1 7.5 21v-3.955a48.842 48.842 0 0 1-2.652-.316c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z"
//               clipRule="evenodd"
//             />
//           </svg>
//           <div className="absolute top-1.5 left-2 dark:text-blk6 text-gray-400">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={3}
//               stroke="currentColor"
//               className="size-3"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
//               />
//             </svg>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
