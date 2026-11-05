// import { useTheme } from "next-themes";
// import { Dispatch, SetStateAction, useEffect, useState } from "react";
// import { memberProps, taskMembersProps } from "../../app/interfaces";
// import SearchUserCard from "../task/Task/SearchUserCard";

// export default function SearchAssigneeBar({
//   setAssignee,
//   assignee,
// }: {
//   setAssignee: Dispatch<SetStateAction<taskMembersProps[]>>;
//   assignee: taskMembersProps[];
// }) {
//   const users: memberProps[] = [
//     {
//       id: "u_020",
//       name: "Ravi Kumar",
//       avatar: "https://picsum.photos/200?random=2",
//       userName: "@raviKumar",
//     },
//     {
//       id: "u_023",
//       name: "Sara Lee",
//       avatar: "https://picsum.photos/200?random=5",
//       userName: "@saraLee",
//     },
//     {
//       id: "u_022",
//       name: "Ravi Kumar",
//       avatar: "https://picsum.photos/200?random=2",
//       userName: "@raviKumar",
//     },
//     {
//       id: "u_043",
//       name: "Sara Lee",
//       avatar: "https://picsum.photos/200?random=5",
//       userName: "@saraLee",
//     },
//     {
//       id: "u_042",
//       name: "Ravi Kumar",
//       avatar: "https://picsum.photos/200?random=2",
//       userName: "@raviKumar",
//     },
//     {
//       id: "u_053",
//       name: "Sara Lee",
//       avatar: "https://picsum.photos/200?random=5",
//       userName: "@saraLee",
//     },
//     {
//       id: "u_052",
//       name: "Ravi Kumar",
//       avatar: "https://picsum.photos/200?random=2",
//       userName: "@raviKumar",
//     },
//     {
//       id: "u_063",
//       name: "Sara Lee",
//       avatar: "https://picsum.photos/200?random=5",
//       userName: "@saraLee",
//     },
//     {
//       id: "u_111",
//       name: "Ravi Kumar",
//       avatar: "https://picsum.photos/200?random=2",
//       userName: "@raviKumar",
//     },
//     {
//       id: "u_121",
//       name: "Ravi Kumar",
//       avatar: "https://picsum.photos/200?random=2",
//       userName: "@raviKumar",
//     },
//     {
//       id: "u_123",
//       name: "Ravi Kumar",
//       avatar: "https://picsum.photos/200?random=2",
//       userName: "@raviKumar",
//     },
//     {
//       id: "u_124",
//       name: "Ravi Kumar",
//       avatar: "https://picsum.photos/200?random=2",
//       userName: "@raviKumar",
//     },
//   ];
//   const { resolvedTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);
//   const [showDropdown, setShowDropDown] = useState(false);
//   useEffect(() => {
//     setMounted(true);
//   }, []);
//   if (!mounted) return null;

//   return (
//     <div>
//       <form className=" flex w-full max-w-lg relative">
//         <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
//           Search
//         </label>
//         <div className="relative flex w-full">
//           <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
//             <svg
//               className="w-4 h-4 text-gray-500 dark:text-gray-400"
//               aria-hidden="true"
//               xmlns="http://www.w3.org/2000/svg"
//               fill={`${resolvedTheme === "dark" ? "currentColor" : "none"}`}
//               viewBox="0 0 20 20"
//             >
//               <path
//                 stroke="currentColor"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
//               />
//             </svg>
//           </div>
//           <input
//             type="search"
//             id="default-search"
//             className="block w-full px-4 py-2 ps-10 text-sm text-gray-900 border-2 border-gray-300 rounded-md bg-gray-100 focus:outline-none dark:bg-blk3 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
//             placeholder="Search Users"
//             required
//             onClick={() => setShowDropDown((prev) => !prev)}
//           />
//         </div>
//         <div
//           id="dropdown"
//           className={`max-h-30 md:max-h-40  overflow-y-auto z-30 shadow-lg absolute top-10 md:top-11 left-1/2 -translate-x-1/2 w-max min-w-full bg-gray-200  transition-all duration-300  rounded-lg dark:bg-blk5 ${
//             showDropdown
//               ? "opacity-100 translate-y-0 visible"
//               : "opacity-0 -translate-y-10 invisible pointer-events-none"
//           }`}
//         >
//           {users.map((a: memberProps, idx: number) => (
//             <SearchUserCard
//               setAssignee={setAssignee}
//               user={a}
//               key={idx}
//               assignee={assignee}
//             ></SearchUserCard>
//           ))}
//         </div>
//       </form>
//     </div>
//   );
// }
