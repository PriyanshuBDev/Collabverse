"use client";

import { WorkspacesProps } from "@/app/interfaces";
import CardWrapper from "../wrappers/CardWrapper";
import { WsCardContent } from "../workspaces/WsCard";

export default function WsCard({ workspace }: { workspace: WorkspacesProps }) {
  return (
    <CardWrapper>
      <WsCardContent ws={workspace} />
    </CardWrapper>
  );
}
