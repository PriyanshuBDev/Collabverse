// import {
//   commentReactionProps,
//   CompleteChatProps,
//   memberProps,
// } from "@/app/interfaces";
// import { MessageType } from "@prisma/client";
// import { create } from "zustand";
// import { subscribeWithSelector } from "zustand/middleware";

// type PendingUpdate =
//   | { type: "reaction"; data: DbReaction }
//   | { type: "media"; data: DbMedia }
//   | { type: "receipt"; data: DbReceipt }
//   | { type: "delete"; data: DbDelete }
//   | { type: "pin"; data: DbPin };
// type DbMessage = {
//   id: string;
//   content: string | null;
//   conversationId: string;
//   workspaceId: string;
//   senderId: string;
//   type: MessageType;
//   editedAt: Date | null;
//   isForwarded: boolean;
//   isDeleted: boolean;
//   callSessionId: string | null;
//   createdAt: Date;
//   replyToMessageId: string | null;
// };
// type DbReaction = {
//   messageId: string;
//   userId: string;
//   reaction: string;
// };
// type DbMedia = {
//   messageId: string;
//   id: string;
//   originalName: string;
//   fileName: string;
//   publicId: string;
//   url: string;
//   format: string;
//   type: string;
//   size: Int16Array;
// };
// type DbReceipt = {
//   id: string;
//   messageId: string;
//   userId: string;
//   deliveredAt: Date | null;
//   seenAt: Date | null;
// };
// type DbDelete = {
//   id: string;
//   messageId: string;
//   userId: string;
//   deletedAt: Date;
// };
// type DbPin = {
//   id: string;
//   messageId: string;
//   pinnedById: string;
//   pinnedAt: Date;
// };

// type chatRTStore = {
//   messages: Map<string, CompleteChatProps>;
//   pendingUpdates: Map<string, PendingUpdate[]>;
//   replyWaitlist: Map<string, string[]>;
//   membersMap: Record<string, memberProps>;
//   currentUserId: string;
//   addMessage: (msg: DbMessage) => void;
//   handleUpdate: (messageId: string, update: PendingUpdate) => void;
//   applyUpdate: (messageId: string, update: PendingUpdate) => void;
//   createBaseMessage: (msg: DbMessage) => CompleteChatProps;
//   resolveReply: (msg: DbMessage) => void;
//   resolveReplyWaitlist: (msg: DbMessage) => void;
// };

// export const useChatRTStore = create(
//   subscribeWithSelector<chatRTStore>((set, get) => ({
//     messages: new Map(),
//     pendingUpdates: new Map(),
//     replyWaitlist: new Map(),
//     membersMap: {},
//     currentUserId: "",

//     // ✅ 1. Create base message
//     createBaseMessage: (msg) => {
//       const { membersMap } = get();

//       return {
//         id: msg.id,
//         type: msg.type,
//         message: msg.content ?? undefined,
//         createdAt: msg.createdAt,
//         sentAt: msg.createdAt,

//         editedAt: msg.editedAt ?? null,
//         isDeleted: msg.isDeleted,
//         isForwarded: msg.isForwarded,

//         media: [],
//         reactions: [],
//         readBy: [],
//         deletedFor: [],

//         isPinned: false,
//         isReadByAll: false,

//         user: membersMap[msg.senderId],

//         replyTo: undefined,
//         deliveredAt: undefined,
//         seenAt: null,
//       };
//     },

//     // ✅ 2. Add message (your onMessageInsert)
//     addMessage: (msg) => {
//       const state = get();

//       const base = state.createBaseMessage(msg);

//       state.messages.set(msg.id, base);

//       // 🔥 apply queued updates
//       const queued = state.pendingUpdates.get(msg.id);
//       if (queued) {
//         queued.forEach((u) => state.applyUpdate(msg.id, u));
//         state.pendingUpdates.delete(msg.id);
//       }

//       // 🔥 resolve reply
//       state.resolveReply(msg);

//       // 🔥 resolve others waiting
//       state.resolveReplyWaitlist(msg);

//       set({ messages: new Map(state.messages) });
//     },

//     // ✅ 3. Queue handler
//     handleUpdate: (messageId, update) => {
//       const state = get();

//       if (!state.messages.has(messageId)) {
//         if (!state.pendingUpdates.has(messageId)) {
//           state.pendingUpdates.set(messageId, []);
//         }

//         state.pendingUpdates.get(messageId)!.push(update);

//         set({ pendingUpdates: new Map(state.pendingUpdates) });
//         return;
//       }

//       state.applyUpdate(messageId, update);

//       set({ messages: new Map(state.messages) });
//     },

//     // ✅ 4. Apply update
//     applyUpdate: (messageId, update) => {
//       const { messages, currentUserId } = get();

//       const msg = messages.get(messageId);
//       if (!msg) return;

//       switch (update.type) {
//         case "reaction":
//           if (!msg.reactions) break;
//           const { userId, reaction } = update.data;
//           msg.reactions.forEach((r) => {
//             r.reactedBy = r.reactedBy.filter((id: string) => id !== userId);
//           });

//           msg.reactions = msg.reactions.filter(
//             (r: commentReactionProps) => r.reactedBy.length > 0,
//           );
//           const existing = msg.reactions.find(
//             (r: commentReactionProps) => r.emoji === reaction,
//           );
//           if (existing) {
//             existing.reactedBy.push(userId);
//           } else {
//             msg.reactions.push({
//               emoji: reaction,
//               reactedBy: [userId],
//             });
//           }
//           break;

//         case "media":
//           msg.media.push({
//             name: update.data.originalName,
//             publicId: update.data.publicId,
//             url: update.data.url,
//             format: update.data.format,
//             type: update.data.type,
//             bytes: Number(update.data.size),
//           });
//           break;

//         case "receipt":
//           if (update.data.seenAt) {
//             if (!msg.readBy.includes(update.data.userId)) {
//               msg.readBy.push(update.data.userId);
//             }
//           }

//           if (update.data.userId === currentUserId) {
//             msg.seenAt = update.data.seenAt;
//             msg.deliveredAt = update.data.deliveredAt;
//           }
//           break;

//         case "delete":
//           msg.deletedFor.push(update.data.userId);
//           break;

//         case "pin":
//           msg.isPinned = true;
//           break;
//       }
//     },

//     // ✅ 5. Resolve reply immediately if possible
//     resolveReply: (msg) => {
//       const state = get();

//       if (!msg.replyToMessageId) return;

//       const reply = state.messages.get(msg.replyToMessageId);

//       if (reply) {
//         state.messages.get(msg.id)!.replyTo = {
//           ...reply,
//           chatId: reply.id,
//           name: reply.media[0].name ?? "",
//           url: reply.media[0].url ?? undefined,
//           messagedBy: reply.user,
//         };
//       } else {
//         if (!state.replyWaitlist.has(msg.replyToMessageId)) {
//           state.replyWaitlist.set(msg.replyToMessageId, []);
//         }

//         state.replyWaitlist.get(msg.replyToMessageId)?.push(msg.id);
//       }
//     },

//     // ✅ 6. Resolve waiting replies
//     resolveReplyWaitlist: (msg) => {
//       // should fetch from backend
//       const state = get();

//       const waiting = state.replyWaitlist.get(msg.id);
//       if (!waiting) return;

//       waiting.forEach((waitingId) => {
//         const waitingMsg = state.messages.get(waitingId);
//         if (!waitingMsg) return;

//         waitingMsg.replyTo = {
//           ...msg,
//           deletedFor: [],
//           chatId: msg.id,
//           name: "",
//           url: undefined,
//           messagedBy: state.membersMap[msg.senderId],
//         };
//       });

//       state.replyWaitlist.delete(msg.id);
//     },
//   })),
// );
