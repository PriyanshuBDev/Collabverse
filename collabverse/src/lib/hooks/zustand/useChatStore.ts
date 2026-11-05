import {
  chatReplyProps,
  CompleteChatProps,
  eventType,
  ReplyPreview,
} from "@/app/interfaces";
import { applyUpdateHelper } from "@/lib/functions/chat/applyUpdateHelper";
import { CallStatus, CallType, MessageType, Prisma } from "@prisma/client";
import { create } from "zustand";

type chatFetchType = "Infinite" | "Around";
export type DbMessage = {
  id: string;
  content: string | null;
  conversationId: string;
  workspaceId: string;
  senderId: string;
  type: MessageType;
  editedAt: Date | null;
  isForwarded: boolean;
  isDeleted: boolean;
  callSessionId: string | null;
  createdAt: Date;
  replyToMessageId: string | null;
  replyPreview: ReplyPreview | null;
  sentAt: Date;
};
export type DbReaction = {
  id: string;
  messageId: string;
  conversationId: string;
  userId: string;
  reaction: string;
};
export type DbMedia = {
  messageId: string;
  conversationId: string;
  id: string;
  originalName: string;
  fileName: string;
  format: string;
  type: string;
  size: number;
  duration?: number;
  order: number;
  path: string;
};
export type DbReceipt = {
  id: string;
  conversationId: string;
  messageId: string;
  userId: string;
  deliveredAt: Date | null;
  seenAt: Date | null;
};
export type DbDelete = {
  id: string;
  conversationId: string;
  messageId: string;
  userId: string;
  deletedAt: Date;
};
export type DbPin = {
  id: string;
  conversationId: string;
  messageId: string;
  messagePreview: Prisma.JsonValue;
  pinnedById: string;
  pinnedAt: Date;
  deletedFor: string[];
};
export type DbMention = {
  id: string;
  conversationId: string;
  messageId: string;
  mentionedUserId: string;
  seen: boolean;
  createdAt: Date;
};
export type DbCall = {
  id: string;
  conversationId: string;
  type: CallType;
  status: CallStatus;
  startedAt: Date | null;
  endedAt: Date | null;
};

export type PendingUpdate =
  | {
      type: "reaction";
      data: DbReaction;
      event: eventType;
    }
  | { type: "media"; data: DbMedia; event: eventType }
  | { type: "receipt"; data: DbReceipt; event: eventType }
  | { type: "delete"; data: DbDelete; event: eventType }
  | { type: "pin"; data: DbPin; event: eventType }
  | {
      type: "call";
      data: DbCall;
      event: "UPDATE";
    };
type ConversationState = {
  messagesMap: Record<string, CompleteChatProps>;
  orderedIds: string[];
  mode: chatFetchType;
  startIndex: number;
  endIndex: number;
  pendingUpdates: Record<string, PendingUpdate[]>;
  topCursor: string | null;
  bottomCursor: string | null;
  lastFetchedAt: number;
  replyWaitlist: Map<string, string[]>; // for staleness
};
type chatStore = {
  conversations: Record<string, ConversationState>;
  initConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  upsertMessages: (conversationId: string, msgs: CompleteChatProps[]) => void;
  setWindow: (conversationId: string, start: number, end: number) => void;
  expandWindowUp: (conversationId: string, count?: number) => void;
  expandWindowDown: (conversationId: string, count?: number) => void;
  setCursors: (
    conversationId: string,
    top: string | null,
    bottom: string | null,
  ) => void;
  updateMessages: (
    conversationId: string,
    id: string,
    updates: Partial<CompleteChatProps>,
  ) => void;
  deleteMessage: (conversationId: string, id: string) => void;
  clearMessages: (conversationId: string) => void;
  addMessageRT: (
    conversationId: string,
    msg: CompleteChatProps,
    currentUserId: string,
  ) => void;
  replaceMessage: (
    conversationId: string,
    msg: CompleteChatProps,
    tempId: string,
  ) => void;
  handleUpdateRT: (
    conversationId: string,
    messageId: string,
    update: PendingUpdate,
    currentUserId: string,
  ) => void;
  cancelMap: Record<string, () => void>;
  setCancelFn: (tempId: string, cancel: () => void) => void;
};

export const useChatStore = create<chatStore>((set) => ({
  conversations: {},
  initConversation: (conversationId) => {
    set((state) => {
      if (state.conversations[conversationId]) return state;

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            messagesMap: {},
            orderedIds: [],
            startIndex: 0,
            endIndex: 0,
            topCursor: null,
            bottomCursor: null,
            lastFetchedAt: 0,
            mode: "Infinite",
            pendingUpdates: {},
            replyWaitlist: new Map(),
          },
        },
      };
    });
  },
  deleteConversation: (conversationId) => {
    set((state) => {
      const conversations = { ...state.conversations };
      delete conversations[conversationId];
      return {
        conversations,
      };
    });
  },
  upsertMessages: (conversationId, msgs) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();
      const newMap = { ...convo.messagesMap };
      const idSet = new Set(convo.orderedIds);
      for (const msg of msgs) {
        newMap[msg.id] = msg;
        idSet.add(msg.id);
      }
      const newOrdered = Array.from(idSet).sort(
        (a: string, b: string) =>
          new Date(newMap[a].createdAt).getTime() -
          new Date(newMap[b].createdAt).getTime(),
      );
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            messagesMap: newMap,
            orderedIds: newOrdered,
            lastFetchedAt: Date.now(),
          },
        },
      };
    });
  },
  setWindow: (conversationId, start, end) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            startIndex: Math.max(0, start),
            endIndex: end,
          },
        },
      };
    });
  },
  expandWindowUp: (conversationId, count = 50) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            startIndex: Math.min(0, convo.startIndex - count),
          },
        },
      };
    });
  },
  expandWindowDown: (conversationId, count = 50) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            endIndex: Math.max(convo.orderedIds.length, convo.endIndex + count),
          },
        },
      };
    });
  },
  setCursors: (conversationId, top, bottom) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            topCursor: top,
            bottomCursor: bottom,
          },
        },
      };
    });
  },
  updateMessages: (conversationId, id, updates) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();
      const existing = convo.messagesMap[id];
      if (!existing) return state;
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            messagesMap: {
              ...convo.messagesMap,
              [id]: {
                ...existing,
                ...updates,
              },
            },
          },
        },
      };
    });
  },
  deleteMessage: (conversationId, id) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();
      const newMap = { ...convo.messagesMap };
      delete newMap[id];
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            messagesMap: newMap,
            orderedIds: convo.orderedIds.filter((mId: string) => mId !== id),
            endIndex: Math.max(0, convo.endIndex - 1),
          },
        },
      };
    });
  },
  clearMessages: (conversationId) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            mode: "Infinite",
            orderedIds: [],
            messagesMap: {},
            startIndex: 0,
            endIndex: 0,
            topCursor: null,
            bottomCursor: null,
          },
        },
      };
    });
  },
  addMessageRT: (conversationId, msg, currentUserId) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();
      const exists = convo.messagesMap[msg.id];
      const newMap = {
        ...convo.messagesMap,
        [msg.id]: exists ? { ...exists, ...msg } : msg,
      };
      const newOrdered = exists
        ? convo.orderedIds
        : insertSorted(convo.orderedIds, msg.id, newMap);

      const queued = convo.pendingUpdates?.[msg.id];
      const waitlist = new Map(convo.replyWaitlist);
      if (queued) {
        queued.forEach((u) => {
          applyUpdateHelper(newMap[msg.id], u, currentUserId);
        });
        resolveReply(newMap, waitlist, msg);
        resolveReplyWaitlist(newMap, waitlist, msg);
        const newPending = { ...convo.pendingUpdates };
        delete newPending[msg.id];
        return {
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...convo,
              pendingUpdates: newPending,
              messagesMap: newMap,
              orderedIds: newOrdered,
              replyWaitlist: waitlist,
              endIndex: Math.max(convo.endIndex, newOrdered.length),
            },
          },
        };
      }
      resolveReply(newMap, waitlist, msg);
      resolveReplyWaitlist(newMap, waitlist, msg);

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            messagesMap: newMap,
            orderedIds: newOrdered,
            replyWaitlist: waitlist,
            endIndex: Math.max(convo.endIndex, newOrdered.length),
          },
        },
      };
    });
  },
  replaceMessage: (conversationId, msg, tempId) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();

      const newMap = {
        ...convo.messagesMap,
      };
      delete newMap[tempId];
      newMap[msg.id] = msg;
      const ordered = convo.orderedIds.filter(
        (id: string) => id !== tempId && id !== msg.id,
      );
      const newOrdered = insertSorted(ordered, msg.id, newMap);
      const waitlist = new Map(convo.replyWaitlist);

      for (const [replyId, waiting] of waitlist) {
        const index = waiting.indexOf(tempId);

        if (index !== -1) {
          waiting[index] = msg.id;
          waitlist.set(replyId, waiting);
          break;
        }
      }
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            messagesMap: newMap,
            orderedIds: newOrdered,
            replyWaitlist: waitlist,
            endIndex: Math.max(convo.endIndex, newOrdered.length),
          },
        },
      };
    });
  },
  handleUpdateRT: (conversationId, messageId, update, currentUserId) => {
    set((state) => {
      const convo =
        state.conversations[conversationId] ?? createEmptyConversation();
      const msg = convo.messagesMap[messageId];
      if (!msg) {
        const queue = convo.pendingUpdates?.[messageId] ?? [];
        return {
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...convo,
              pendingUpdates: {
                ...convo.pendingUpdates,
                [messageId]: [...queue, update],
              },
            },
          },
        };
      }
      const updateMsg = {
        ...msg,
        reactions: msg.reactions ? [...msg.reactions] : [],
        media: [...msg.media],
      };
      applyUpdateHelper(updateMsg, update, currentUserId);
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...convo,
            messagesMap: {
              ...convo.messagesMap,
              [messageId]: updateMsg,
            },
          },
        },
      };
    });
  },
  cancelMap: {},
  setCancelFn: (tempId, cancel) => {
    set((state) => {
      const map = state.cancelMap;
      const newMap = { ...map, [tempId]: cancel };
      return {
        cancelMap: newMap,
      };
    });
  },
}));
function insertSorted(
  ids: string[],
  newId: string,
  map: Record<string, CompleteChatProps>,
) {
  const newTime = new Date(map[newId].createdAt).getTime();

  let i = ids.length - 1;
  while (i >= 0 && new Date(map[ids[i]].createdAt).getTime() > newTime) {
    i--;
  }

  return [...ids.slice(0, i + 1), newId, ...ids.slice(i + 1)];
}
export function createEmptyConversation(): ConversationState {
  return {
    messagesMap: {},
    orderedIds: [],
    startIndex: 0,
    endIndex: 0,
    topCursor: null,
    bottomCursor: null,
    lastFetchedAt: 0,
    mode: "Infinite",
    pendingUpdates: {},
    replyWaitlist: new Map(),
  };
}
function createReplyTo(msg: CompleteChatProps): chatReplyProps {
  return {
    ...msg,
    chatId: msg.id,
    name: msg.media[0]?.name ?? "",
    duration: msg.media[0]?.duration,
    messagedBy: {
      id: msg.user.id ?? "",
      name: msg.user.name,
    },
  };
}
function resolveReply(
  newMap: Record<string, CompleteChatProps>,
  waitlist: Map<string, string[]>,
  msg: CompleteChatProps,
) {
  if (!msg.replyToMsgId) return;

  const reply = newMap[msg.replyToMsgId];

  if (reply) {
    newMap[msg.id].replyTo = createReplyTo(reply);
  } else {
    if (!waitlist.has(msg.replyToMsgId)) {
      waitlist.set(msg.replyToMsgId, []);
    }

    waitlist.get(msg.replyToMsgId)?.push(msg.id);
  }
}
function resolveReplyWaitlist(
  newMap: Record<string, CompleteChatProps>,
  waitlist: Map<string, string[]>,
  msg: CompleteChatProps,
) {
  const waiting = waitlist.get(msg.id);
  if (!waiting) return;

  waiting.forEach((waitingId) => {
    const waitingMsg = newMap[waitingId];
    if (!waitingMsg) return;

    waitingMsg.replyTo = createReplyTo(msg);
  });

  waitlist.delete(msg.id);
}
