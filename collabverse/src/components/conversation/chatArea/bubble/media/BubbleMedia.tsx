import { chatMediaProps, CompleteChatProps } from "@/app/interfaces";
import { getMediaCategory } from "@/lib/functions/chat/getMediaCategory";
import Image from "next/image";
import { useState } from "react";
import { mediaSvg } from "@/components/svg/mediaSvg";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import { DataFormatter } from "@/lib/functions/download/DataFormatter";
import SmallDownloadBtn from "@/components/btns/download/SmallDownloadBrtn";
import { useMediaStore } from "@/lib/hooks/zustand/useMediaStore";
import Spinner1 from "@/components/loadings/Spinner1";
import VideoPreview from "./VideoPreview";
import AudioMsgCard from "./AudioMsgCard";
import Carousel from "./Carousel";
import { UploadBtn } from "@/components/btns/download/UploadBtn";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";

export function BubbleMedia({
  chat,
  isUser,
  refreshSignedUrls,
}: {
  chat: CompleteChatProps;
  isUser: boolean;
  refreshSignedUrls: () => Promise<void>;
}) {
  const [showCarousel, setShowCarousel] = useState(false);
  const [index, setIndex] = useState(0);
  const urls = useMediaStore((s) => s.urls);
  const media = chat.media;
  const firstMediaFormat = getMediaCategory(media[0]?.type, media[0]?.format);
  const photoVideo =
    media.length > 0 &&
    (firstMediaFormat === "video" || firstMediaFormat === "photo");
  const singleMedia = media.at(0);
  const urlForSingles = singleMedia?.path
    ? urls[chat.id]?.paths[singleMedia.path]?.url
    : singleMedia?.url;
  const cancelFn = useChatStore.getState().cancelMap[chat.id];
  return (
    <>
      {(chat.type === "album" ||
        chat.type === "photo" ||
        chat.type === "video") && (
        <>
          {" "}
          {media.length >= 4 && (
            <div
              className={`relative ${chat.replyTo ? "mt-2" : ""} ${
                chat.message ? "mb-1" : ""
              }`}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-3">
                {media
                  .slice(0, 4)
                  .sort(
                    (a: chatMediaProps, b: chatMediaProps) => a.order - b.order,
                  )
                  .map((m: chatMediaProps, i: number) => {
                    const url = m.path
                      ? urls[chat.id]?.paths[m.path]?.url
                      : m.url;
                    return getMediaCategory(m.type, m.format) === "photo" ? (
                      <div
                        key={m.id}
                        className={`relative w-30 h-30 rounded-xl col-span-1 row-span-1  overflow-hidden cursor-pointer  `}
                        onClick={() => {
                          if (url) {
                            setIndex(i);
                            setShowCarousel(true);
                          }
                        }}
                      >
                        {!url ? (
                          <div className="inset-0 absolute flex items-center justify-center">
                            <Spinner1 size={"size-3 lg:size-4"} />
                          </div>
                        ) : (
                          <Image
                            alt={"media"}
                            src={url}
                            className="object-center object-cover"
                            fill
                            onError={async () => {
                              await refreshSignedUrls();
                            }}
                          />
                        )}

                        {media.length > 4 && i === 3 && (
                          <div
                            className="absolute rounded-xl inset-0 bg-black/50 text-4xl text-white flex items-center justify-center cursor-pointer"
                            onClick={() => {
                              if (url) {
                                setIndex(3);
                                setShowCarousel(true);
                              }
                            }}
                          >
                            +{media.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        key={m.id}
                        className="relative col-span-1 row-span-1"
                      >
                        {!url ? (
                          <div className="inset-0 absolute flex items-center justify-center">
                            <Spinner1 size={"size-3 lg:size-4"} />
                          </div>
                        ) : (
                          <VideoPreview
                            src={url}
                            size="w-30 h-30"
                            svgSize="size-4"
                            onClick={() => {
                              if (url) {
                                setIndex(i);
                                setShowCarousel(true);
                              }
                            }}
                            refresh={refreshSignedUrls}
                          />
                        )}
                        {media.length > 4 && i === 3 && (
                          <div
                            className="absolute inset-0 rounded-xl bg-black/50 text-4xl text-white flex items-center justify-center cursor-pointer"
                            onClick={() => {
                              if (url) {
                                setIndex(3);
                                setShowCarousel(true);
                              }
                            }}
                          >
                            +{media.length - 4}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              {/* <DownloadButton
              urls={media.map((m: chatMediaProps) => m.url)}
              isUser={isUser}
            /> */}
            </div>
          )}
          {media.length <= 3 &&
            media.length > 0 &&
            (firstMediaFormat === "video" || firstMediaFormat === "photo") && (
              <div
                className={`relative ${chat.replyTo ? "mt-2" : ""} ${
                  chat.message ? "mb-1" : ""
                }`}
              >
                <div className="grid grid-cols-2 grid-rows-2 gap-3 h-63 w-63">
                  {media
                    .sort(
                      (a: chatMediaProps, b: chatMediaProps) =>
                        a.order - b.order,
                    )
                    .map((m: chatMediaProps, i: number) => {
                      const url = m.path
                        ? urls[chat.id]?.paths[m.path]?.url
                        : m.url;
                      return getMediaCategory(m.type, m.format) === "photo" ? (
                        <div
                          key={m.id}
                          className={`relative w-full h-full rounded-xl  overflow-hidden cursor-pointer  ${
                            media.length === 1
                              ? "col-span-2 row-span-2"
                              : media.length === 2
                                ? i >= 0
                                  ? "col-span-1 row-span-2"
                                  : ""
                                : i === 0
                                  ? "col-span-1 row-span-2"
                                  : "col-span-1 row-span-1"
                          } `}
                          onClick={() => {
                            if (url) {
                              setIndex(i);
                              setShowCarousel(true);
                            }
                          }}
                        >
                          {!url ? (
                            <div className="inset-0 absolute flex items-center justify-center">
                              <Spinner1
                                size={
                                  media.length === 1
                                    ? "size-5 lg:size-6"
                                    : "size-3 lg:size-4"
                                }
                              />
                            </div>
                          ) : (
                            <Image
                              alt={"media"}
                              src={url}
                              className="object-cover"
                              fill
                              onError={async () => {
                                await refreshSignedUrls();
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <div
                          key={m.id}
                          className={`relative ${
                            media.length === 1
                              ? "col-span-2 row-span-2"
                              : media.length === 2
                                ? i >= 0
                                  ? "col-span-1 row-span-2"
                                  : ""
                                : i === 0
                                  ? "col-span-1 row-span-2"
                                  : "col-span-1 row-span-1"
                          }`}
                        >
                          {!url ? (
                            <div className="inset-0 absolute flex items-center justify-center">
                              <Spinner1
                                size={
                                  media.length === 1
                                    ? "size-5 lg:size-6"
                                    : "size-3 lg:size-4"
                                }
                              />
                            </div>
                          ) : (
                            <VideoPreview
                              src={url}
                              size="w-full h-full"
                              svgSize="size-4"
                              onClick={() => {
                                if (url) {
                                  setIndex(i);
                                  setShowCarousel(true);
                                }
                              }}
                              refresh={refreshSignedUrls}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
                {/* <DownloadButton
                urls={media.map((m: chatMediaProps) => m.url)}
                isUser={isUser}
              /> */}
              </div>
            )}
        </>
      )}

      {media.length > 0 &&
        getMediaCategory(singleMedia?.type, singleMedia?.format) ===
          "audio" && (
          <AudioMsgCard
            src={urlForSingles}
            isUser={isUser}
            size={singleMedia?.bytes ?? 0}
          />
        )}
      {media.length > 0 && singleMedia && chat.type === "document" && (
        <div
          className={`${
            isUser
              ? "bg-blue-400 dark:bg-blue-600/80"
              : "bg-gray-100 dark:bg-blk3"
          } rounded-2xl p-3  flex items-center gap-2 w-full`}
        >
          <div className="w-fit">
            {mediaSvg(singleMedia?.type, singleMedia?.format, "size-7")}
          </div>
          <FlexBtwWrapper addOns="gap-3">
            <div className=" ">
              <div className="text-sm font-semibold text-ellipsis line-clamp-2">
                {singleMedia.name}
              </div>
              <div className="text-xs">{DataFormatter(singleMedia.bytes)}</div>
            </div>
            {!urlForSingles ? (
              <Spinner1 size={"size-3"} />
            ) : (
              <SmallDownloadBtn urls={[urlForSingles]} isUser={isUser} />
            )}
          </FlexBtwWrapper>
        </div>
      )}
      {chat.sending && chat.sending.status === "uploading" && (
        <div className="inset-0 absolute flex items-center justify-center">
          <UploadBtn progress={chat.sending.progress} cancel={cancelFn} />
        </div>
      )}
      {photoVideo && showCarousel && (
        <Carousel
          chat={chat}
          index={index}
          setIndex={setIndex}
          showCarousel={showCarousel}
          setShowCarousel={setShowCarousel}
          sender={isUser ? "You" : chat.user.name}
          refresh={refreshSignedUrls}
        />
      )}
    </>
  );
}
