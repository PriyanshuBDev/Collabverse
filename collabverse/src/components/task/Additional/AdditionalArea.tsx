"use client";
import { useState } from "react";
import BorderWrapper from "../../wrappers/BorderWrapper";
import CommentArea from "./Comment/CommentArea";
import AttachmentArea from "./Attachment/AttachmentArea";
import TaskToggler from "@/components/Toggler/TaskToggler";
import TaskUserArea from "./User/TaskUserArea";
import ActivityArea from "./Activity/ActivityArea";
import { TaskSettingsArea } from "./Settings/TaskSettingsArea";

export default function AdditionalArea() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <BorderWrapper>
      <TaskToggler selected={selected} setSelected={setSelected} />
      {selected === "comments" && <CommentArea />}
      {selected === "activities" && <ActivityArea />}
      {selected === "attachments" && <AttachmentArea />}
      {selected === "users" && <TaskUserArea />}
      {selected === "settings" && <TaskSettingsArea />}
    </BorderWrapper>
  );
}
