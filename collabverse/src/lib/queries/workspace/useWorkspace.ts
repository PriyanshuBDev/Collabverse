"use client";

import { WsPermission, WsRole } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getCurrentWorkspace } from "../../axios/workspace/getCurrentWorkspace";
import { deleteCookie, setCookie } from "cookies-next";
import { useEffect } from "react";
export type WsMembersPerm = Extract<WsPermission, "Invite" | "Create_Project">;
export interface currentWsPermProps {
  admin: WsPermission[];
  member: WsMembersPerm[];
}
export interface currentWsProps {
  id: string;
  name: string;
  slug: string;
  role: WsRole;
  permissions: currentWsPermProps;
}
export function useWorkspace(slug: string, initialData?: currentWsProps) {
  const query = useQuery<currentWsProps, AxiosError>({
    queryKey: ["workspace", slug],
    queryFn: async () => await getCurrentWorkspace({ slug }),
    enabled: Boolean(slug),
    initialData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      const status = error.response?.status;
      if (status === 403 || status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
  useEffect(() => {
    if (query.data) {
      setCookie("workspace", query.data.slug);
    }
  }, [query.data]);

  useEffect(() => {
    if (!query.error) return;

    const status = query.error.response?.status;

    if (status === 403 || status === 404) {
      deleteCookie("workspace");
    }
  }, [query.error]);
  return query;
}
// import { create } from "zustand";
// interface workspaceSate {
//   id?: string;
//   name?: string;
//   slug?: string;
//   setWs: (data: { id: string; name: string; slug: string }) => void;
//   clearWs: () => void;
// }
// export const useWorkspace = create<workspaceSate>((set) => ({
//   id: undefined,
//   name: undefined,
//   slug: undefined,
//   setWs: (data: { id?: string; name?: string; slug?: string }) =>
//     set((state) => {
//       if (
//         state.id === data.id &&
//         state.name === data.name &&
//         state.slug === data.slug
//       ) {
//         return state;
//       }
//       return { ...state, ...data };
//     }),
//   clearWs: () => set({ id: undefined, name: undefined, slug: undefined }),
// }));

// interface WorkspaceState {
//   id?: string;
//   name?: string;
//   slug?: string;
//   setWorkspace: (data: { id: string; name: string; slug: string }) => void;
//   clearWorkspace: () => void;
// }

// export const useWorkspace = create<WorkspaceState>((set) => ({
//   id: undefined,
//   name: undefined,
//   slug: undefined,
//   setWorkspace: (data) => set({ ...data }),
//   clearWorkspace: () => set({ id: undefined, name: undefined, slug: undefined }),
// }));
