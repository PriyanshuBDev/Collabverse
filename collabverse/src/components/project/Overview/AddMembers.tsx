// import { memberProps, ProjectMembersProps } from "@/app/interfaces";
// import { Dispatch, SetStateAction, useState } from "react";
// import AddMemSearchbar from "./AddMemSearchbar";
// import AddMembersCard from "./AddMembersCard";

// export default function AddMembers({
//   id,
//   setShowAddMembers,
//   setMembers,
//   members,
// }: {
//   id: string;
//   setShowAddMembers: Dispatch<SetStateAction<boolean>>;
//   setMembers: Dispatch<SetStateAction<ProjectMembersProps[]>>;
//   members: ProjectMembersProps[];
// }) {
//   const allUsers: memberProps[] = [
//     {
//       id: "mem-1",
//       name: "Alice Johnson",
//       userName: "@alice",
//       avatar: "https://picsum.photos/200?random=11",
//     },
//     {
//       id: "mem-2",
//       name: "Bob Smith",
//       userName: "@bob",

//       avatar: "https://picsum.photos/200?random=12",
//     },
//     {
//       id: "mem-3",
//       name: "Carol Lee",
//       userName: "@carol",

//       avatar: "https://picsum.photos/200?random=13",
//     },
//     {
//       id: "mem-4",
//       name: "Daniel Green",
//       userName: "@daniel",
//       avatar: "https://picsum.photos/200?random=14",
//     },
//     {
//       id: "mem-5",
//       name: "Evelyn Brown",
//       userName: "@evelyn",

//       avatar: "https://picsum.photos/200?random=15",
//     },
//     {
//       id: "mem-6",
//       name: "Frank White",
//       userName: "@frank",

//       avatar: "https://picsum.photos/200?random=16",
//     },
//     {
//       id: "mem-8",
//       name: "Henry Wilson",
//       userName: "@henry",

//       avatar: "https://picsum.photos/200?random=18",
//     },
//     {
//       id: "mem-11",
//       name: "Kate Parker",
//       userName: "@kate",

//       avatar: "https://picsum.photos/200?random=21",
//     },
//     {
//       id: "mem-9",
//       name: "Ivy Chen",
//       userName: "@ivy",

//       avatar: "https://picsum.photos/200?random=19",
//     },
//   ];
//   const [filteredUsers, setFilteredUsers] = useState(allUsers);
//   return (
//     <div>
//       <div className="flex items-center gap-4 mb-3">
//         <div
//           className="p-2 rounded-md bg-gray-200 dark:bg-blk6 hover:bg-gray-400 dark:hover:bg-blk8 cursor-pointer text-gray-900 dark:text-gray-100"
//           onClick={() => {
//             setShowAddMembers(false);
//           }}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={1.5}
//             stroke="currentColor"
//             className="size-5"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
//             />
//           </svg>
//         </div>
//         <div className="text-gray-700 dark:text-gray-200 text-lg lg:text-xl font-semibold px-1">
//           Add Members
//         </div>
//       </div>
//       <AddMemSearchbar
//         users={allUsers}
//         setFilteredUsers={setFilteredUsers}
//       ></AddMemSearchbar>
//       <div className="mt-3">
//         {filteredUsers.length > 0 ? (
//           <div
//             className="flex gap-0.5 flex-col lg:h-100 h-85 overflow-y-auto overflow-x-hidden text-gray-900 dark:text-gray-100 thinScrollbar"
//             onMouseDown={(e) => e.stopPropagation()}
//             onTouchStart={(e) => e.stopPropagation()}
//           >
//             {filteredUsers.map((u: memberProps) => (
//               <AddMembersCard
//                 key={u.id}
//                 setMembers={setMembers}
//                 user={u}
//                 members={members}
//               ></AddMembersCard>
//             ))}
//           </div>
//         ) : (
//           <div className="text-gray-500 flex items-center justify-center text-base h-50">
//             No users found
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
