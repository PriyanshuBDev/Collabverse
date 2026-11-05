// import Image from "next/image";

// import getInitials from "@/lib/functions/user/getInitials";
// import FlexBtwWrapper from "../../wrappers/FlexBtwWrapper";
// import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
// import { ProjectMembersProps, projManagersPerm } from "../../../app/interfaces";
// import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
// import { useClickOutSide } from "@/lib/hooks/useClickOutside";
// import { createPortal } from "react-dom";
// import DemoteWarning from "../../warnings/DemoteWarning";
// import RoleChange from "@/components/warnings/RoleChange";
// import OnlyOne from "@/components/warnings/OnlyOne";
// import RemoveUserWarning from "@/components/warnings/RemoveUserWarning";

// export default function UserCard({
//   user,
//   managers,
//   setUsers,
//   setShow,
//   managerPerm,
// }: {
//   user: ProjectMembersProps;
//   managers: number;
//   setUsers: Dispatch<SetStateAction<ProjectMembersProps[]>>;
//   setShow: Dispatch<SetStateAction<boolean>>;
//   managerPerm: projManagersPerm;
// }) {
//   const [role, setRole] = useState(user.role);
//   const roles = ["Manager", "Contributor", "Viewer"];
//   const [currentUserRole, setCurrentUserRole] = useState("Manager");
//   const [dropdown, setDropDown] = useState(false);
//   const [showWarning, setShowWarning] = useState(false);
//   const [showOnlyOneWarning, setShowOnlyOneWarning] = useState(false);
//   const [showRemoveWarning, setShowRemoveWarning] = useState(false);
//   const [showRoleWarning, setShowRoleWarning] = useState(false);
//   const [onlyOneType, setOnlyOneType] = useState("");
//   const [mounted, setMounted] = useState(false);
//   const dropRef = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     setMounted(true);
//   }, []);
//   useClickOutSide([dropRef], () => {
//     setDropDown(false);
//   });
//   const handleDemoting = () => {
//     setUsers((prev) =>
//       prev.map((item: ProjectMembersProps) =>
//         item.id === user.id ? { ...item, role: role } : item,
//       ),
//     );
//     setDropDown(false);
//     setShow(false);
//   };
//   const currentUserId = "mem-1";
//   if (!mounted) return null;
//   const canRemove =
//     currentUserRole === "Owner" ||
//     (currentUserRole === "Manager" &&
//       managerPerm.canRemoveMem &&
//       user.role !== "Manager");
//   return (
//     <>
//       <div
//         className={`min-w-xs lg:min-w-md max-w-md transition-all duration-300 ease-out bg-gray-50 dark:bg-blk4 mb-2`}
//       >
//         <FlexBtwWrapper>
//           <div className="flex items-center gap-2">
//             {user.avatar ? (
//               <div className="relative w-8 h-8 lg:h-10 lg:w-10 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
//                 <Image
//                   alt={"MembersAvatar"}
//                   src={user.avatar}
//                   className="object-center"
//                   fill
//                 ></Image>
//               </div>
//             ) : (
//               <div
//                 className={`w-8 h-8 lg:h-10 lg:w-10 rounded-full flex justify-center items-center  border-2 border-white dark:border-blk5`}
//                 style={{ background: gradientBgFromName(user.name) }}
//               >
//                 <div className="font-semibold text-xs text-white">
//                   {getInitials(user.name)}
//                 </div>
//               </div>
//             )}
//             <div className="">
//               <div className="text-gray-800 dark:text-gray-200 text-sm lg:text-base text-nowrap">
//                 {user.name}
//               </div>
//               <div className="text-blue-500  text-xs text-nowrap">
//                 {user.userName}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             {currentUserRole === "Owner" ||
//             (currentUserRole === "Manager" &&
//               (user.id === currentUserId || user.role !== "Manager")) ? (
//               <div
//                 ref={dropRef}
//                 className="relative lg:min-w-30 min-w-25 cursor-pointer"
//               >
//                 <div
//                   className="border dark:border-gray-500 border-gray-400 hover:bg-gray-300 dark:hover:bg-blk6 dark:bg-blk3 bg-gray-200 rounded-lg w-23 lg:w-30 px-2 lg:px-3 py-0.5 flex items-center justify-between gap-1"
//                   onClick={() => {
//                     setDropDown((prev) => !prev);
//                   }}
//                 >
//                   <div className="text-xs lg:text-sm">{user.role}</div>
//                   <div>
//                     <svg
//                       className="w-4 h-4 text-gray-500 "
//                       aria-hidden="true"
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="24"
//                       height="24"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         stroke="currentColor"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="m8 15 4 4 4-4m0-6-4-4-4 4"
//                       />
//                     </svg>
//                   </div>
//                 </div>
//                 <div
//                   id="dropdown"
//                   className={`z-30 py-1  shadow-lg absolute top-0 -left-1 w-23 lg:w-32  bg-gray-100 border dark:border-gray-500 border-gray-400 transition-all duration-300  rounded-lg  dark:bg-blk3 ${
//                     dropdown
//                       ? "opacity-100 visible"
//                       : "opacity-0 invisible pointer-events-none"
//                   }`}
//                 >
//                   {roles.map((r: string, idx: number) => (
//                     <div
//                       className={`text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-blk6  px-2 lg:px-3 py-0.5  text-xs lg:text-base cursor-pointer ${
//                         r === user.role && "border-l-4 border-blue-500"
//                       }`}
//                       onClick={() => {
//                         if (user.role === r) return;
//                         if (user.role === "Manager" && managers === 1) {
//                           setOnlyOneType("change role");
//                           setShowOnlyOneWarning(true);
//                           return;
//                         }
//                         if (
//                           user.id === currentUserId &&
//                           user.role === "Manager" &&
//                           user.role !== r
//                         ) {
//                           setShowWarning(true);
//                           setDropDown(false);
//                           setRole(r);
//                           return;
//                         }
//                         setShowRoleWarning(true);
//                         setRole(r);
//                         setDropDown(false);
//                       }}
//                       key={idx}
//                     >
//                       {r}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300">
//                 {user.role}
//               </div>
//             )}

//             {canRemove && (
//               <button
//                 className={` cursor-pointer text-gray-500 text-xs lg:text-sm font-semibold  `}
//                 onClick={() => {
//                   if (managers === 1 && user.role === "Manager") {
//                     setOnlyOneType("remove");
//                     setShowOnlyOneWarning(true);
//                     return;
//                   }
//                   setShowRemoveWarning(true);
//                 }}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth={1.5}
//                   stroke="currentColor"
//                   className="size-5 lg:size-6"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
//                   />
//                 </svg>
//               </button>
//             )}
//           </div>
//         </FlexBtwWrapper>
//       </div>{" "}
//       {createPortal(
//         <DemoteWarning
//           showWarning={showWarning}
//           setShowWarning={setShowWarning}
//           currentPosition={user.role}
//           afterPosition={role}
//           handleDemoting={handleDemoting}
//         />,
//         document.body,
//       )}
//       {createPortal(
//         <OnlyOne
//           showWarning={showOnlyOneWarning}
//           setShowWarning={setShowOnlyOneWarning}
//           type="Manager"
//           actionType={onlyOneType}
//         />,
//         document.body,
//       )}
//       {createPortal(
//         <RoleChange
//           showWarning={showRoleWarning}
//           setShowWarning={setShowRoleWarning}
//           currentRole={user.role}
//           newRole={role}
//           user={user}
//           handleRoleChange={() => {
//             setUsers((prev) =>
//               prev.map((item: ProjectMembersProps) =>
//                 item.id === user.id ? { ...item, role: role } : item,
//               ),
//             );
//           }}
//         />,
//         document.body,
//       )}
//       {createPortal(
//         <RemoveUserWarning
//           showWarning={showRemoveWarning}
//           setShowWarning={setShowRemoveWarning}
//           handleRemove={() => {
//             setUsers((prev) =>
//               prev.filter((p: ProjectMembersProps) => p.id !== user.id),
//             );
//           }}
//           user={user}
//           type="project"
//         />,
//         document.body,
//       )}
//     </>
//   );
// }
