"use client";

import { useState } from "react";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import MainBtn from "../btns/MainBtn";

export default function FileUploaderWidget() {
  const [url, setUrl] = useState("");

  return (
    <div className="flex flex-col items-center gap-4">
      <CldUploadWidget
        uploadPreset="my_preset"
        options={{ folder: "Collabverse_attachments" }}
        onSuccess={async (result) => {
          const info = result.info as CloudinaryUploadWidgetInfo;
          setUrl(info.secure_url);
          try {
            // await handleProfileUpload(info.secure_url);
          } catch (e) {
            console.error(
              "Error encountered:",
              e instanceof Error ? e.message : e
            );
            alert("Error encountered");
          }
        }}
      >
        {({ open }) => (
          <MainBtn
            onClick={() => open()}
            addOns="flex items-center gap-1 px-2 py-1.5 md:py-2 md:px-3 md:my-2 my-1.5 "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 md:size-5"
            >
              <path
                fillRule="evenodd"
                d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
            Add
          </MainBtn>
        )}
      </CldUploadWidget>
    </div>
  );
}
