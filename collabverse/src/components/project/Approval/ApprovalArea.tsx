// import { approvalReqProps } from "@/app/interfaces";
// import ApprovalCard from "./ApprovalCard";
// import { useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import AllApproval from "@/components/warnings/JoinReqWarning";

// export default function ApprovalArea({ slug }: { slug: string }) {
//   const ua: approvalReqProps[] = [
//     {
//       id: "ua_001",
//       user: {
//         id: "u_101",
//         name: "Rohit Sharma",
//         username: "rohit_s",
//         avatar: "https://picsum.photos/seed/rohit/200",
//         role: "Contributor",
//       },
//       invitedBy: {
//         id: "u_001",
//         name: "Aman Verma",
//         username: "aman_owner",
//         avatar: "https://picsum.photos/seed/aman/200",
//       },
//       createdAt: new Date("2025-12-21T10:15:00"),
//     },
//     {
//       id: "ua_002",
//       user: {
//         id: "u_102",
//         name: "Neha Gupta",
//         username: "neha_g",
//         role: "Viewer",
//       },
//       invitedBy: {
//         id: "u_002",
//         name: "Kunal Mehta",
//         username: "kunal_admin",
//         avatar: "https://picsum.photos/seed/kunal/200",
//       },
//       createdAt: new Date("2025-12-21T11:40:00"),
//     },
//     {
//       id: "ua_003",
//       user: {
//         id: "u_103",
//         name: "Arjun Patel",
//         username: "arjun_p",
//         avatar: "https://picsum.photos/seed/arjun/200",
//         role: "Contributor",
//       },
//       invitedBy: {
//         id: "u_001",
//         name: "Aman Verma",
//         username: "aman_owner",
//       },
//       createdAt: new Date("2025-12-22T09:05:00"),
//     },
//     {
//       id: "ua_004",
//       user: {
//         id: "u_104",
//         name: "Sneha Iyer",
//         username: "sneha_i",
//         role: "Contributor",
//       },
//       invitedBy: {
//         id: "u_003",
//         name: "Rahul Singh",
//         username: "rahul_admin",
//         avatar: "https://picsum.photos/seed/rahul/200",
//       },
//       createdAt: new Date("2025-12-22T12:30:00"),
//     },
//     {
//       id: "ua_005",
//       user: {
//         id: "u_105",
//         name: "Vikram Joshi",
//         username: "vikram_j",
//         avatar: "https://picsum.photos/seed/vikram/200",
//         role: "Viewer",
//       },
//       invitedBy: {
//         id: "u_001",
//         name: "Aman Verma",
//         username: "aman_owner",
//       },
//       createdAt: new Date("2025-12-22T15:10:00"),
//     },
//     {
//       id: "ua_006",
//       user: {
//         id: "u_106",
//         name: "Pooja Nair",
//         username: "pooja_n",
//         role: "Contributor",
//       },
//       invitedBy: {
//         id: "u_002",
//         name: "Kunal Mehta",
//         username: "kunal_admin",
//       },
//       createdAt: new Date("2025-12-23T08:50:00"),
//     },
//     {
//       id: "ua_007",
//       user: {
//         id: "u_107",
//         name: "Sahil Khan",
//         username: "sahil_k",
//         avatar: "https://picsum.photos/seed/sahil/200",
//         role: "Manager",
//       },
//       invitedBy: {
//         id: "u_001",
//         name: "Aman Verma",
//         username: "aman_owner",
//         avatar: "https://picsum.photos/seed/aman/200",
//       },
//       createdAt: new Date("2025-12-23T09:20:00"),
//     },
//     {
//       id: "ua_008",
//       user: {
//         id: "u_108",
//         name: "Ananya Das",
//         username: "ananya_d",
//         role: "Contributor",
//       },
//       invitedBy: {
//         id: "u_003",
//         name: "Rahul Singh",
//         username: "rahul_admin",
//       },
//       createdAt: new Date("2025-12-23T10:00:00"),
//     },
//     {
//       id: "ua_009",
//       user: {
//         id: "u_109",
//         name: "Karthik R",
//         username: "karthik_r",
//         avatar: "https://picsum.photos/seed/karthik/200",
//         role: "Viewer",
//       },
//       invitedBy: {
//         id: "u_001",
//         name: "Aman Verma",
//         username: "aman_owner",
//       },
//       createdAt: new Date("2025-12-23T10:45:00"),
//     },
//     {
//       id: "ua_010",
//       user: {
//         id: "u_110",
//         name: "Meera Kulkarni",
//         username: "meera_k",
//         role: "Contributor",
//       },
//       invitedBy: {
//         id: "u_002",
//         name: "Kunal Mehta",
//         username: "kunal_admin",
//         avatar: "https://picsum.photos/seed/kunal/200",
//       },
//       createdAt: new Date("2025-12-23T11:30:00"),
//     },
//   ];
//   const [showWarning, setShowWarning] = useState(false);
//   const [type, setType] = useState("");
//   const [approvals, setApprovals] = useState<approvalReqProps[]>(ua);
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => {
//     setMounted(true);
//   }, []);
//   if (!approvals || approvals.length < 1) {
//     return (
//       <div className="flex flex-col h-full">
//         <div className="flex-1 flex items-center justify-center text-xs sm:text-base lg:text-xl">
//           No Pending Approvals
//         </div>
//       </div>
//     );
//   }
//   const handleAction = () => {
//     setApprovals([]);
//   };
//   return (
//     <>
//       <div className="mt-3 pb-10">
//         <div className={`flex items-center justify-between gap-2 px-5`}>
//           <div className="lg:text-lg md:text-base text-sm text-gray-700 dark:text-gray-300">
//             {approvals.length} pending requests available for approval
//           </div>

//           <div className="flex items-center gap-5">
//             <div
//               className="lg:px-4 px-2  py-1 rounded-md bg-red-500 hover:bg-red-600 text-white lg:text-base sm:text-sm text-xs font-semibold cursor-pointer"
//               onClick={() => {
//                 setShowWarning(true);
//                 setType("Reject");
//               }}
//             >
//               Reject All
//             </div>
//             <div
//               className="lg:px-4 px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white lg:text-base sm:text-sm text-xs font-semibold cursor-pointer"
//               onClick={() => {
//                 setShowWarning(true);
//                 setType("Accept");
//               }}
//             >
//               Accept All
//             </div>
//           </div>
//         </div>
//         <table className=" w-full   text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-5 rounded-xl overflow-hidden shadow-md">
//           <thead className="  text-[10px] sm:text-xs lg:text-sm text-gray-700 uppercase bg-gray-200 dark:bg-blk4 dark:text-gray-400 z-20 shadow-md">
//             <tr>
//               <th scope="col" className="px-6 py-2 lg:py-3 ">
//                 User
//               </th>
//               <th scope="col" className="px-6 py-2 lg:py-3">
//                 Invited By
//               </th>
//               <th scope="col" className="px-6 py-2 lg:py-3">
//                 Requested At
//               </th>
//               <th scope="col" className="px-6 py-2 lg:py-3">
//                 Role
//               </th>
//               <th scope="col" className="px-6 py-2 lg:py-3">
//                 Options
//               </th>
//             </tr>
//           </thead>
//           <tbody className="lg:text-base text-xs ">
//             {approvals.map((a: approvalReqProps) => (
//               <ApprovalCard key={a.id} a={a} setApprovals={setApprovals} />
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {mounted &&
//         createPortal(
//           <AllApproval
//             showWarning={showWarning}
//             setShowWarning={setShowWarning}
//             type={type}
//             handleAction={handleAction}
//           />,
//           document.body,
//         )}
//     </>
//   );
// }
