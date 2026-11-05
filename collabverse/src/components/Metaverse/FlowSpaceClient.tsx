"use client";

import dynamic from "next/dynamic";

const FlowSpace = dynamic(() => import("@/components/Metaverse/FlowSpace"), {
  ssr: false,
});

export default function FlowSpaceClient() {
  return <FlowSpace />;
}
