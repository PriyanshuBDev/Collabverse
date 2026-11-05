// import { taskMembersProps } from "@/app/interfaces";
// import Xbtn from "@/components/btns/Xbtn";
// import Searchbar from "@/components/project/Overview/Searchbar";

// import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
// import { Dispatch, SetStateAction, useMemo, useState } from "react";
// import TaskUserCard from "../../Task/TaskUserCard";
// import AddTaskMembers from "./AddTaskMembers";

// export default function TaskMembers({
//   members,
//   setMembers,
//   setShow,
//   show,
//   id,
//   cURoleInProject,
// }: {
//   members: taskMembersProps[];
//   setMembers: Dispatch<SetStateAction<taskMembersProps[]>>;
//   setShow: Dispatch<SetStateAction<boolean>>;
//   show: boolean;
//   id: string;
//   cURoleInProject: string;
// }) {
//   const [search, setSearch] = useState("");
//   const filterMembers = (role: string) => {
//     return filteredUsers.filter((m: taskMembersProps) => m.role === role);
//   };
//   const filteredUsers = useMemo(() => {
//     if (!search.trim()) return members;

//     return members.filter(
//       (m) =>
//         m.name.toLowerCase().includes(search.toLowerCase()) ||
//         m.userName.toLowerCase().includes(search.toLowerCase()),
//     );
//   }, [members, search]);
//   const [showAddMembers, setShowAddMembers] = useState(false);
//   const assignees = filterMembers("Assignee");
//   const reviewers = filterMembers("Reviewer");
//   const enable = cURoleInProject === "Manager" || cURoleInProject === "Owner";

//   return (
//     <OverlayWrapper active={show && members.length > 0}>
//       <div className="max-w-xl  lg:w-[29rem] lg:h-130 sm:w-[25rem] w-[21rem]">
//         <div
//           className={`${showAddMembers ? "pointer-events-none hidden" : ""}`}
//         >
//           <div className="flex justify-end">
//             <Xbtn
//               size="size-6"
//               addOns="-mt-2 pb-1"
//               onClick={() => {
//                 setShow(false);
//               }}
//             />
//           </div>
//           <div className="flex items-center justify-center w-full">
//             <Searchbar
//               search={search}
//               setSearch={setSearch}
//               placeholder="Search users inside this tasks..."
//             ></Searchbar>
//           </div>
//           {enable && (
//             <div
//               className=" hover:bg-gray-200 dark:hover:bg-blk8 cursor-pointer px-2 py-1 rounded-lg flex items-center gap-2  mt-2"
//               onClick={() => setShowAddMembers(true)}
//             >
//               <div className="w-9 h-9 flex items-center justify-center bg-gray-300 dark:bg-blk6 text-gray-500 rounded-full border border-gray-400 dark:border-blk9">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth={1.5}
//                   stroke="currentColor"
//                   className="size-6"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
//                   />
//                 </svg>
//               </div>
//               <div className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
//                 Add new users
//               </div>
//             </div>
//           )}
//           <div
//             className={`overflow-y-auto overflow-x-hidden  mt-2 thinScrollbar ${
//               enable ? "lg:h-100 h-80" : "h-90 lg:h-110"
//             }`}
//           >
//             <div>
//               <div className="flex items-center gap-2">
//                 <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
//                   Assignee
//                 </div>
//                 <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
//                   {assignees.length}
//                 </div>
//               </div>
//               <div className="mt-2">
//                 {assignees.map((a: taskMembersProps) => (
//                   <TaskUserCard
//                     user={a}
//                     key={a.id}
//                     setUsers={setMembers}
//                     canChange={enable}
//                   />
//                 ))}
//               </div>
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
//                   Reviewer
//                 </div>
//                 <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
//                   {reviewers.length}
//                 </div>
//               </div>
//               <div className="mt-2   ">
//                 {reviewers.map((a: taskMembersProps) => (
//                   <TaskUserCard
//                     user={a}
//                     key={a.id}
//                     setUsers={setMembers}
//                     canChange={enable}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//         {showAddMembers && (
//           <AddTaskMembers
//             id={id}
//             setShowAddMembers={setShowAddMembers}
//             setMembers={setMembers}
//             members={members}
//           ></AddTaskMembers>
//         )}
//       </div>
//     </OverlayWrapper>
//   );
// }
