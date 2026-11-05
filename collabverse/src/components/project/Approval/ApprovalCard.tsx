// import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
// import getInitials from "@/lib/functions/user/getInitials";
// import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
// import Image from "next/image";
// import { Dispatch, SetStateAction } from "react";
// import { userApprovalProps } from "@/app/interfaces";

// export default function ApprovalCard({
//   a,
//   setApprovals,
// }: {
//   a: userApprovalProps;
//   setApprovals: Dispatch<SetStateAction<userApprovalProps[]>>;
// }) {
//   return (
//     <>
//       <tr
//         key={a.id}
//         className="bg-gray-100 border-b dark:bg-blk3 dark:border-gray-700 border-gray-200 "
//       >
//         <th
//           scope="row"
//           className="px-3 py-2 lg:py-3 lg:px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
//         >
//           <div className="flex items-center gap-2">
//             <div className="w-fit">
//               {a.user.avatar ? (
//                 <div className="relative w-7 h-7 lg:h-9 lg:w-9 rounded-sm overflow-hidden ">
//                   <Image
//                     alt={"AssigneeAvatar"}
//                     src={a.user.avatar}
//                     className="object-center"
//                     fill
//                   ></Image>
//                 </div>
//               ) : (
//                 <div
//                   className={`w-7 h-7 lg:h-9 lg:w-9 rounded-sm flex justify-center items-center `}
//                   style={{ background: gradientBgFromName(a.user.name) }}
//                 >
//                   <div className="font-semibold text-xs text-white">
//                     {getInitials(a.user.name)}
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div className="flex flex-col  justify-start ">
//               <div className="text-sm lg:text-base text-gray-800 dark:text-gray-200 font-semibold">
//                 {a.user.name}
//               </div>
//               <div className="text-xs text-blue-500 ">{a.user.userName}</div>
//             </div>
//           </div>
//         </th>
//         <td className="px-3 py-2 lg:py-3 lg:px-6">
//           <div className="flex items-center gap-2">
//             <div className="w-fit">
//               {a.invitedBy.avatar ? (
//                 <div className="relative w-7 h-7 lg:h-9 lg:w-9 rounded-full overflow-hidden ">
//                   <Image
//                     alt={"AssigneeAvatar"}
//                     src={a.invitedBy.avatar}
//                     className="object-center"
//                     fill
//                   ></Image>
//                 </div>
//               ) : (
//                 <div
//                   className={`w-7 h-7 lg:h-9 lg:w-9 rounded-full flex justify-center items-center `}
//                   style={{ background: gradientBgFromName(a.invitedBy.name) }}
//                 >
//                   <div className="font-semibold text-xs text-white">
//                     {getInitials(a.invitedBy.name)}
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div className="flex flex-col  justify-start ">
//               <div className="text-sm lg:text-base text-gray-800 dark:text-gray-200 font-semibold">
//                 {a.invitedBy.name}
//               </div>
//               <div className="text-xs text-blue-500 ">
//                 {a.invitedBy.userName}
//               </div>
//             </div>
//           </div>
//         </td>
//         <td className="px-3 py-2 lg:py-3 lg:px-6 text-nowrap lg:text-base text-xs">
//           {DateFormatter2(a.createdAt)}
//         </td>
//         <td className="px-3 py-2 lg:py-3 lg:px-6 lg:text-base text-xs text-gray-900 dark:text-gray-100 font-semibold">
//           {a.user.role}
//         </td>
//         <td className="px-1 py-2 lg:py-3 text-xs lg:text-sm">
//           <div className="flex items-center lg:gap-5 gap-2">
//             <div
//               className="lg:px-3 px-1.5 py-0.5 rounded-md bg-red-500 hover:bg-red-600 text-white lg:text-sm text-xs font-semibold cursor-pointer"
//               onClick={() =>
//                 setApprovals((prev: UserApprovalProps[]) =>
//                   prev.filter((p: UserApprovalProps) => p.id === a.id),
//                 )
//               }
//             >
//               Reject
//             </div>
//             <div
//               className="lg:px-3 px-1.5 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white lg:text-sm text-xs font-semibold cursor-pointer"
//               onClick={() =>
//                 setApprovals((prev: UserApprovalProps[]) =>
//                   prev.filter((p: UserApprovalProps) => p.id === a.id),
//                 )
//               }
//             >
//               Accept
//             </div>
//           </div>
//         </td>
//       </tr>
//     </>
//   );
// }
