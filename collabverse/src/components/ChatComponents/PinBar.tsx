// import { useEffect, useLayoutEffect, useRef, useState } from "react";
// import { taskCommentProps } from "../../app/interfaces";
// import htmlToText from "@/lib/functions/chat/htmlToText";
// import { useTheme } from "next-themes";
// import PinChatBubble from "./PinChatBubble";
// import CommentsDateIndicatorFormatter from "@/lib/functions/date/commentsDateIndicatorFormatter";

// export default function PinBar({
//   pins,
//   handleScrollTo,
// }: {
//   pins: taskCommentProps[];
//   handleScrollTo: (targetId: string) => void;
// }) {
//   const [role, setRole] = useState("Manager");
//   const [pinIndex, setPinIndex] = useState(0);
//   const dropContentRef = useRef<HTMLDivElement>(null); // <--- measure height
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [height, setHeight] = useState("0px");
//   const [showDrop, setShowDrop] = useState(false);
//   const isUserNearBottomRef = useRef(true);
//   const isAutoScrollingRef = useRef(false);
//   const prevCountRef = useRef(pins?.length);
//   const hasInitialScrollRef = useRef(false);
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   const { resolvedTheme } = useTheme();
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (dropContentRef.current) {
//       if (showDrop) {
//         const scrollHeight = dropContentRef.current.scrollHeight;
//         setHeight(Math.min(scrollHeight, 400) + "px"); // expand smoothly
//       } else {
//         setHeight("0px"); // collapse smoothly
//       }
//     }
//   }, [showDrop]);
//   const handlePinLoop = () => {
//     const target = pins[pinIndex];
//     handleScrollTo(target.id);

//     if (pinIndex < pins.length - 1) {
//       handleScrollingPins(pinIndex + 1);
//       setPinIndex(pinIndex + 1);
//     } else {
//       handleScrollingPins(0);
//       setPinIndex(0);
//     }
//   };

//   const handleScrollingPins = (targetId: number) => {
//     const element = document.getElementById(`pin-${targetId}`);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth", block: "center" });
//     }
//   };

//   const groupedPinsByDate = pins?.reduce<Record<string, taskCommentProps[]>>(
//     (acc, pin) => {
//       const date = new Date(pin.createdAt).toISOString().split("T")[0];
//       if (!acc[date]) acc[date] = [];
//       acc[date].push(pin);
//       return acc;
//     },
//     {},
//   );

//   const sortedGroupedPins = Object.entries(groupedPinsByDate ?? {}).sort(
//     ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
//   );
//   function scrollToBottom({ smooth = true } = {}) {
//     const c = scrollRef.current;
//     if (!c) return;
//     isAutoScrollingRef.current = true;
//     c.scrollTo({ top: c.scrollHeight, behavior: smooth ? "smooth" : "auto" });
//     // give the browser time to complete.
//     window.setTimeout(() => {
//       isAutoScrollingRef.current = false;
//     }, 300);
//   }
//   useEffect(() => {
//     const c = scrollRef.current;
//     if (!c) return;
//     const onScroll = () => {
//       const nearBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 10;
//       isUserNearBottomRef.current = nearBottom;
//       setShowScrollButton(!nearBottom);
//     };
//     c.addEventListener("scroll", onScroll, { passive: true });
//     onScroll();
//     return () => c.removeEventListener("scroll", onScroll);
//   }, []);
//   useEffect(() => {
//     const c = scrollRef.current;
//     if (!c) return;
//     const onScroll = () => {
//       const nearBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 10;
//       isUserNearBottomRef.current = nearBottom;
//       setShowScrollButton(!nearBottom);
//     };
//     c.addEventListener("scroll", onScroll, { passive: true });
//     onScroll();
//     return () => c.removeEventListener("scroll", onScroll);
//   }, []);

//   // ---------- initial mount: scroll after images loaded ----------
//   // Wait for images in the container to load (prevents layout jump) and then scroll to bottom once.
//   useEffect(() => {
//     const c = scrollRef.current;
//     if (!c || hasInitialScrollRef.current) return;

//     const tryScrollAfterImages = () => {
//       const imgs = Array.from(c.querySelectorAll<HTMLImageElement>("img"));
//       const pending = imgs.filter((i) => !i.complete);
//       if (pending.length === 0) {
//         // direct scroll
//         requestAnimationFrame(() => scrollToBottom({ smooth: false }));
//         hasInitialScrollRef.current = true;
//         return;
//       }

//       // attach listeners (once)
//       let remaining = pending.length;
//       const onDone = () => {
//         remaining--;
//         if (remaining <= 0) {
//           requestAnimationFrame(() => scrollToBottom({ smooth: false }));
//           hasInitialScrollRef.current = true;
//         }
//       };
//       pending.forEach((img) => {
//         img.addEventListener("load", onDone, { once: true });
//         img.addEventListener("error", onDone, { once: true });
//       });

//       // fallback timeout in case loads take too long
//       setTimeout(() => {
//         if (!hasInitialScrollRef.current) {
//           requestAnimationFrame(() => scrollToBottom({ smooth: false }));
//           hasInitialScrollRef.current = true;
//         }
//       }, 1000);
//     };

//     // do on next paint
//     requestAnimationFrame(tryScrollAfterImages);
//   }, []); // run once

//   // ---------- preserve scroll / auto-scroll on new comments ----------
//   // Only watch comments.length to avoid re-trigger on reference changes.
//   useLayoutEffect(() => {
//     const c = scrollRef.current;
//     if (!c || !pins) {
//       prevCountRef.current = pins?.length ?? 0;
//       return;
//     }

//     const prevCount = prevCountRef.current ?? 0;
//     const newCount = pins.length;

//     // snapshot before DOM update
//     const prevScrollTop = c.scrollTop;
//     const prevScrollHeight = c.scrollHeight;

//     // wait for DOM update (paint)
//     requestAnimationFrame(() => {
//       const newScrollHeight = c.scrollHeight;
//       const heightDiff = newScrollHeight - prevScrollHeight;

//       if (isUserNearBottomRef.current) {
//         // if user was at bottom, keep it at bottom
//         scrollToBottom({ smooth: false });
//       } else if (heightDiff > 0) {
//         // user read older messages: maintain relative position
//         c.scrollTop = prevScrollTop + heightDiff;
//       }

//       // if count increased AND user is near bottom, ensure bottom (covers fast adds)
//       if (newCount > prevCount && isUserNearBottomRef.current) {
//         scrollToBottom({ smooth: false });
//       }

//       prevCountRef.current = newCount;
//     });
//   }, [pins]);
//   if (!mounted) {
//     return null;
//   }

//   return (
//     <div className="shrink-0 h-13  px-5 border-b-2 border-gray-300 dark:border-gray-700  rounded-t-xl flex items-center relative">
//       <span className=" text-gray-500 lg:pr-2 pr-1">
//         {resolvedTheme === "dark" ? (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="19"
//             height="19"
//             fill="currentColor"
//             className="rotate-45"
//             viewBox="0 0 16 16"
//           >
//             <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354" />
//           </svg>
//         ) : (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="19"
//             height="19"
//             fill="currentColor"
//             className="rotate-45"
//             viewBox="0 0 16 16"
//           >
//             <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354m1.58 1.408-.002-.001zm-.002-.001.002.001A.5.5 0 0 1 6 2v5a.5.5 0 0 1-.276.447h-.002l-.012.007-.054.03a5 5 0 0 0-.827.58c-.318.278-.585.596-.725.936h7.792c-.14-.34-.407-.658-.725-.936a5 5 0 0 0-.881-.61l-.012-.006h-.002A.5.5 0 0 1 10 7V2a.5.5 0 0 1 .295-.458 1.8 1.8 0 0 0 .351-.271c.08-.08.155-.17.214-.271H5.14q.091.15.214.271a1.8 1.8 0 0 0 .37.282" />
//           </svg>
//         )}
//       </span>

//       <div
//         className="overflow-hidden lg:h-12.5 h-11.5 w-full cursor-pointer hover:bg-gray-200 dark:hover:bg-blk4"
//         onClick={handlePinLoop}
//       >
//         {pins.map((p: taskCommentProps, idx: number) => (
//           <div
//             key={idx}
//             className="flex flex-col gap-1 lg:px-3 px-2 py-1.5 lg:py-2"
//             id={`pin-${idx}`}
//           >
//             <div className="text-blue-700 dark:text-blue-500 font-semibold text-xs">
//               Pinned Message #{idx + 1}
//             </div>
//             <div className="text-gray-700 dark:text-gray-300 text-xs text-ellipsis line-clamp-1">
//               {htmlToText(p.comment)}
//             </div>
//           </div>
//         ))}
//       </div>

//       <span
//         className=" text-gray-500 hover:bg-gray-300 dark:hover:bg-blk6 p-1 rounded-full cursor-pointer"
//         onClick={() => {
//           setShowDrop((prev) => !prev);
//         }}
//       >
//         {resolvedTheme === "dark" ? (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             fill="currentColor"
//             className="size-6"
//           >
//             <path d="M6 12a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 1 1 1.5 0v7.5A.75.75 0 0 1 6 12ZM18 12a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 1.5 0v7.5A.75.75 0 0 1 18 12ZM6.75 20.25v-1.5a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0ZM18.75 18.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 1.5 0ZM12.75 5.25v-1.5a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0ZM12 21a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 1.5 0v7.5A.75.75 0 0 1 12 21ZM3.75 15a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0ZM12 11.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5ZM15.75 15a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0Z" />
//           </svg>
//         ) : (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={1.5}
//             stroke="currentColor"
//             className="size-6"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
//             />
//           </svg>
//         )}
//       </span>
//       <div
//         style={{
//           maxHeight: height,
//           opacity: showDrop ? 1 : 0,
//           transform: showDrop
//             ? "translateY(0) scale(1)"
//             : "translateY(-10px) scale(0.98)",
//           transition: "all 0.3s ease",
//         }}
//         className={`absolute top-13  bg-gray-200 dark:bg-blk3 left-0 right-0 z-2000 shadow-xl rounded-b-lg  border-gray-400 dark:border-gray-700 ${
//           showDrop ? "pointer-events-auto" : "pointer-events-none"
//         }`}
//         ref={dropContentRef}
//       >
//         <div className="relative">
//           <div
//             ref={scrollRef}
//             className="relative overflow-y-auto max-h-[350px]"
//           >
//             {sortedGroupedPins.map(
//               ([date, pins]: [string, taskCommentProps[]]) => (
//                 <div key={date}>
//                   <div id={`date-${date}`} className="flex justify-center ">
//                     <div className="bg-gray-300 dark:bg-blk7 text-gray-700 dark:text-gray-200 text-xs px-3 py-1 ml-4 rounded-full shadow  my-2">
//                       {CommentsDateIndicatorFormatter(new Date(date))}
//                     </div>
//                   </div>
//                   {pins.map((pin: taskCommentProps) => (
//                     <PinChatBubble
//                       key={pin.id}
//                       comment={pin}
//                       handleScrollTo={handleScrollTo}
//                       setShowDrop={setShowDrop}
//                     />
//                   ))}
//                 </div>
//               ),
//             )}
//           </div>
//           {showScrollButton && (
//             <button
//               onClick={() => scrollToBottom({ smooth: true })}
//               className={`absolute bottom-3 right-4 cursor-pointer  bg-gray-300 text-gray-800 dark:text-gray-200 dark:bg-blk5 dark:hover:bg-blk7 hover:bg-gray-400 rounded-full p-2 shadow-lg transition-all duration-300 ${
//                 showScrollButton
//                   ? "opacity-100 scale-100"
//                   : "opacity-0 scale-75 pointer-events-none"
//               }`}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//                 className="size-4 lg:size-5"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </button>
//           )}
//         </div>

//         {role === "Manager" && (
//           <div className="text-blue-500 border-t-2 border-gray-300 dark:border-gray-700 flex justify-center lg:text-lg text-sm py-2 hover:bg-gray-300 dark:hover:bg-blk5 rounded-b-xl cursor-pointer">
//             Unpin All Comments
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
