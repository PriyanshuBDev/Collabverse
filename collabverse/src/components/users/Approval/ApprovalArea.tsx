import { approvalReqProps } from "@/app/interfaces";
import ApprovalCard from "./ApprovalCard";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import useMounted from "@/lib/hooks/useMounted";
import Pagination from "../List/Pagination";
import { useIsAllowed } from "@/lib/hooks/useIsAllowed";
import { useJoinRequests } from "@/lib/queries/workspace/users/useJoinRequests";
import { toast } from "sonner";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import Spinner1 from "@/components/loadings/Spinner1";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { joinReqStatus } from "@/lib/axios/workspace/users/updateJoinRequest";
import JoinReqWarning from "@/components/warnings/JoinReqWarning";

export interface updateReqProps {
  request: approvalReqProps;
  status: joinReqStatus;
}

export default function ApprovalArea() {
  // const ua: approvalReqProps[] = [
  //   {
  //     id: "ua_001",
  //     user: {
  //       id: "u_101",
  //       name: "Rohit Sharma",
  //       username: "rohit_s",
  //       avatar: "https://picsum.photos/seed/rohit/200",
  //       role: "Member",
  //     },
  //     invitedBy: {
  //       id: "u_001",
  //       name: "Aman Verma",

  //       avatar: "https://picsum.photos/seed/aman/200",
  //     },
  //     createdAt: new Date("2025-12-21T10:15:00"),
  //   },
  //   {
  //     id: "ua_002",
  //     user: {
  //       id: "u_102",
  //       name: "Neha Gupta",
  //       username: "neha_g",
  //       role: "Admin",
  //     },
  //     invitedBy: {
  //       id: "u_002",
  //       name: "Kunal Mehta",

  //       avatar: "https://picsum.photos/seed/kunal/200",
  //     },
  //     createdAt: new Date("2025-12-21T11:40:00"),
  //   },
  //   {
  //     id: "ua_003",
  //     user: {
  //       id: "u_103",
  //       name: "Arjun Patel",
  //       username: "arjun_p",
  //       avatar: "https://picsum.photos/seed/arjun/200",
  //       role: "Member",
  //     },
  //     invitedBy: {
  //       id: "u_001",
  //       name: "Aman Verma",
  //     },
  //     createdAt: new Date("2025-12-22T09:05:00"),
  //   },
  //   {
  //     id: "ua_004",
  //     user: {
  //       id: "u_104",
  //       name: "Sneha Iyer",
  //       username: "sneha_i",
  //       role: "Member",
  //     },
  //     invitedBy: {
  //       id: "u_003",
  //       name: "Rahul Singh",

  //       avatar: "https://picsum.photos/seed/rahul/200",
  //     },
  //     createdAt: new Date("2025-12-22T12:30:00"),
  //   },
  //   {
  //     id: "ua_005",
  //     user: {
  //       id: "u_105",
  //       name: "Vikram Joshi",
  //       username: "vikram_j",
  //       avatar: "https://picsum.photos/seed/vikram/200",
  //       role: "Admin",
  //     },
  //     invitedBy: {
  //       id: "u_001",
  //       name: "Aman Verma",
  //     },
  //     createdAt: new Date("2025-12-22T15:10:00"),
  //   },
  //   {
  //     id: "ua_006",
  //     user: {
  //       id: "u_106",
  //       name: "Pooja Nair",
  //       username: "pooja_n",
  //       role: "Member",
  //     },
  //     invitedBy: {
  //       id: "u_002",
  //       name: "Kunal Mehta",
  //     },
  //     createdAt: new Date("2025-12-23T08:50:00"),
  //   },
  //   {
  //     id: "ua_007",
  //     user: {
  //       id: "u_107",
  //       name: "Sahil Khan",
  //       username: "sahil_k",
  //       avatar: "https://picsum.photos/seed/sahil/200",
  //       role: "Member",
  //     },
  //     invitedBy: {
  //       id: "u_001",
  //       name: "Aman Verma",

  //       avatar: "https://picsum.photos/seed/aman/200",
  //     },
  //     createdAt: new Date("2025-12-23T09:20:00"),
  //   },
  //   {
  //     id: "ua_008",
  //     user: {
  //       id: "u_108",
  //       name: "Ananya Das",
  //       username: "ananya_d",
  //       role: "Member",
  //     },
  //     invitedBy: {
  //       id: "u_003",
  //       name: "Rahul Singh",
  //     },
  //     createdAt: new Date("2025-12-23T10:00:00"),
  //   },
  //   {
  //     id: "ua_009",
  //     user: {
  //       id: "u_109",
  //       name: "Karthik R",
  //       username: "karthik_r",
  //       avatar: "https://picsum.photos/seed/karthik/200",
  //       role: "Admin",
  //     },
  //     invitedBy: {
  //       id: "u_001",
  //       name: "Aman Verma",
  //     },
  //     createdAt: new Date("2025-12-23T10:45:00"),
  //   },
  //   {
  //     id: "ua_010",
  //     user: {
  //       id: "u_110",
  //       name: "Meera Kulkarni",
  //       username: "meera_k",
  //       role: "Member",
  //     },
  //     invitedBy: {
  //       id: "u_002",
  //       name: "Kunal Mehta",

  //       avatar: "https://picsum.photos/seed/kunal/200",
  //     },
  //     createdAt: new Date("2025-12-23T11:30:00"),
  //   },
  // ];
  const { role } = useCurrentWorkspace();
  const [req, setReq] = useState<updateReqProps | null>(null);
  const adminApprovePerm = useIsAllowed("Approve_Join", "admin");
  const [page, setPage] = useState(1);
  const { data, isFetching, isError, updateRequest, isUpdating } =
    useJoinRequests({ page, setPage });
  const mounted = useMounted();
  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong while fetching approvals");
    }
  }, [isError]);

  if (isFetching) {
    return <TableSkeleton />;
  }
  if (!data || data.requests.length < 1) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center text-xs sm:text-base lg:text-xl">
          No pending approvals
        </div>
      </div>
    );
  }
  const allowed = (role === "Member" && adminApprovePerm) || role === "Owner";
  return (
    <>
      <div className="mt-3 pb-10">
        <table className=" w-full   text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-5 rounded-xl overflow-hidden shadow-md">
          <thead className="  text-[10px] sm:text-xs lg:text-sm text-gray-700 uppercase bg-gray-200 dark:bg-blk4 dark:text-gray-400 z-20 shadow-md">
            <tr>
              <th scope="col" className="px-6 py-2 lg:py-3 ">
                User
              </th>
              <th scope="col" className="px-6 py-2 lg:py-3">
                Invited By
              </th>
              <th scope="col" className="px-6 py-2 lg:py-3">
                Requested At
              </th>
              <th scope="col" className="px-6 py-2 lg:py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-2 lg:py-3">
                Options
              </th>
            </tr>
          </thead>
          <tbody className="lg:text-base text-xs ">
            {data.requests.map((a: approvalReqProps) => (
              <ApprovalCard
                key={a.id}
                a={a}
                setReq={setReq}
                allowed={allowed}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        total={data.total}
        totalPage={Math.ceil(data.total / data.limit)}
        page={page}
        setPage={setPage}
      ></Pagination>
      {mounted &&
        createPortal(
          <JoinReqWarning
            showWarning={!!req}
            req={req}
            setReq={setReq}
            handleAction={() => {
              if (!req) return;
              updateRequest({ reqId: req.request.id, status: req.status });
            }}
          />,
          document.body,
        )}
      {
        <div
          className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 ${
            isUpdating ? "visible" : "invisible pointer-events-none"
          }`}
        >
          <Spinner1
            fill="fill-gray-800 dark:fill-gray-200"
            size="size-10 lg:size-16"
            color="text-gray-200 dark:text-blk3"
          ></Spinner1>
        </div>
      }
    </>
  );
}
