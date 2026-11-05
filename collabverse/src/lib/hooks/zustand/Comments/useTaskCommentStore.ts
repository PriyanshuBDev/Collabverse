import {
  commentReplyProps,
  CompleteCommentProps,
  eventType,
} from "@/app/interfaces";
import { applyCommentUpdateHelper } from "@/lib/functions/comment/applyCommentUpdateHelper";
import { create } from "zustand";

type commentFetchType = "Infinite" | "Around";

export type commentReplyPrivew = {
  id: string;
  commentedBy: {
    id?: string;
    name: string;
  };
  comment: string;
};

export type CommentDb = {
  id: string;
  comment: string;
  sentAt: Date;
  createdAt: Date;
  isDeleted: boolean;
  taskId: string;
  replyToCommentId: string;
  commentedById: string;
  replyPreview: commentReplyPrivew | null;
};

export type CommentReactionDb = {
  id: string;
  reaction: string;
  commentId: string;
  reactedById: string;
  taskId: string;
};

export type CommentMentionDb = {
  id: string;
  commentId: string;
  seen: boolean;
  mentionedUserId: string;
  createdAt: Date;
  taskId: string;
};

export type CommentReceiptDb = {
  id: string;
  commentId: string;
  userId: string;
  deliveredAt: Date | null;
  seenAt: Date | null;
  taskId: string;
};

export type commentPendingUpdate =
  | {
      type: "reaction";
      data: CommentReactionDb;
      event: eventType;
    }
  | { type: "receipt"; data: CommentReceiptDb; event: eventType };
type taskCommentState = {
  commentsMap: Record<string, CompleteCommentProps>;
  orderedIds: string[];
  mode: commentFetchType;
  startIndex: number;
  endIndex: number;
  pendingUpdates: Record<string, commentPendingUpdate[]>;
  topCursor: string | null;
  bottomCursor: string | null;
  lastFetchedAt: number;
  replyWaitlist: Map<string, string[]>; // for staleness
};
type commentStore = {
  tasks: Record<string, taskCommentState>;
  initTaskState: (taskId: string) => void;
  deleteTaskState: (taskId: string) => void;
  upsertComments: (taskId: string, comments: CompleteCommentProps[]) => void;
  setWindow: (taskId: string, start: number, end: number) => void;
  expandWindowUp: (taskId: string, count?: number) => void;
  expandWindowDown: (taskId: string, count?: number) => void;
  setCursors: (
    taskId: string,
    top: string | null,
    bottom: string | null,
  ) => void;
  updateComments: (
    taskId: string,
    id: string,
    updates: Partial<CompleteCommentProps>,
  ) => void;
  deleteComment: (taskId: string, id: string) => void;
  addCommentRT: (
    taskId: string,
    comment: CompleteCommentProps,
    currentUserId: string,
  ) => void;
  replaceComment: (
    taskId: string,
    comment: CompleteCommentProps,
    tempId: string,
  ) => void;
  handleUpdateRT: (
    taskId: string,
    commentId: string,
    update: commentPendingUpdate,
    currentUserId: string,
  ) => void;
  cancelMap: Record<string, () => void>;
  setCancelFn: (tempId: string, cancel: () => void) => void;
};

export const useCommentStore = create<commentStore>((set) => ({
  tasks: {},
  initTaskState: (taskId) => {
    set((state) => {
      if (state.tasks[taskId]) return state;

      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            commentsMap: {},
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
  deleteTaskState: (taskId) => {
    set((state) => {
      const tasks = { ...state.tasks };
      delete tasks[taskId];
      return {
        tasks,
      };
    });
  },
  upsertComments: (taskId, comments) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();
      const newMap = { ...task.commentsMap };
      const idSet = new Set(task.orderedIds);
      for (const comment of comments) {
        newMap[comment.id] = comment;
        idSet.add(comment.id);
      }
      const newOrdered = Array.from(idSet).sort(
        (a: string, b: string) =>
          new Date(newMap[a].sentAt).getTime() -
          new Date(newMap[b].sentAt).getTime(),
      );
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            commentsMap: newMap,
            orderedIds: newOrdered,
            lastFetchedAt: Date.now(),
          },
        },
      };
    });
  },
  setWindow: (taskId, start, end) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            startIndex: Math.max(0, start),
            endIndex: end,
          },
        },
      };
    });
  },
  expandWindowUp: (taskId, count = 50) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();

      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            startIndex: Math.min(0, task.startIndex - count),
          },
        },
      };
    });
  },
  expandWindowDown: (taskId, count = 50) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();

      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            endIndex: Math.max(task.orderedIds.length, task.endIndex + count),
          },
        },
      };
    });
  },
  setCursors: (taskId, top, bottom) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            topCursor: top,
            bottomCursor: bottom,
          },
        },
      };
    });
  },
  updateComments: (taskId, id, updates) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();
      const existing = task.commentsMap[id];
      if (!existing) return state;
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            commentsMap: {
              ...task.commentsMap,
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
  deleteComment: (taskId, id) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();
      const newMap = { ...task.commentsMap };
      delete newMap[id];
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            commentsMap: newMap,
            orderedIds: task.orderedIds.filter((cId: string) => cId !== id),
            endIndex: Math.max(0, task.endIndex - 1),
          },
        },
      };
    });
  },
  addCommentRT: (taskId, comment, currentUserId) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();
      const exists = task.commentsMap[comment.id];
      const newMap = {
        ...task.commentsMap,
        [comment.id]: exists ? { ...exists, ...comment } : comment,
      };
      const newOrdered = exists
        ? task.orderedIds
        : insertSorted(task.orderedIds, comment.id, newMap);

      const queued = task.pendingUpdates?.[comment.id];
      const waitlist = new Map(task.replyWaitlist);
      if (queued) {
        queued.forEach((u) => {
          applyCommentUpdateHelper(newMap[comment.id], u, currentUserId);
        });
        resolveReply(newMap, waitlist, comment);
        resolveReplyWaitlist(newMap, waitlist, comment);
        const newPending = { ...task.pendingUpdates };
        delete newPending[comment.id];
        return {
          tasks: {
            ...state.tasks,
            [taskId]: {
              ...task,
              pendingUpdates: newPending,
              commentsMap: newMap,
              orderedIds: newOrdered,
              replyWaitlist: waitlist,
              endIndex: Math.max(task.endIndex, newOrdered.length),
            },
          },
        };
      }
      resolveReply(newMap, waitlist, comment);
      resolveReplyWaitlist(newMap, waitlist, comment);
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            commentsMap: newMap,
            orderedIds: newOrdered,
            replyWaitlist: waitlist,
            endIndex: Math.max(task.endIndex, newOrdered.length),
          },
        },
      };
    });
  },
  replaceComment: (taskId, comment, tempId) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();

      const newMap = {
        ...task.commentsMap,
      };
      delete newMap[tempId];
      newMap[comment.id] = comment;
      const ordered = task.orderedIds.filter((id: string) => id !== tempId);
      const newOrdered = insertSorted(ordered, comment.id, newMap);
      const waitlist = new Map(task.replyWaitlist);

      for (const [replyId, waiting] of waitlist) {
        const index = waiting.indexOf(tempId);

        if (index !== -1) {
          waiting[index] = comment.id;
          waitlist.set(replyId, waiting);
          break;
        }
      }
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            commentsMap: newMap,
            orderedIds: newOrdered,
            replyWaitlist: waitlist,
            endIndex: Math.max(task.endIndex, newOrdered.length),
          },
        },
      };
    });
  },
  handleUpdateRT: (taskId, commentId, update, currentUserId) => {
    set((state) => {
      const task = state.tasks[taskId] ?? createEmptyTask();
      const comment = task.commentsMap[commentId];
      if (!comment) {
        const queue = task.pendingUpdates?.[commentId] ?? [];
        return {
          tasks: {
            ...state.tasks,
            [taskId]: {
              ...task,
              pendingUpdates: {
                ...task.pendingUpdates,
                [commentId]: [...queue, update],
              },
            },
          },
        };
      }
      const updateComment = {
        ...comment,
        reactions: comment.reactions ? [...comment.reactions] : [],
      };
      applyCommentUpdateHelper(updateComment, update, currentUserId);
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            commentsMap: {
              ...task.commentsMap,
              [commentId]: updateComment,
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
  map: Record<string, CompleteCommentProps>,
) {
  const newTime = new Date(map[newId].sentAt).getTime();

  let i = ids.length - 1;
  while (i >= 0 && new Date(map[ids[i]].sentAt).getTime() > newTime) {
    i--;
  }

  return [...ids.slice(0, i + 1), newId, ...ids.slice(i + 1)];
}
export function createEmptyTask(): taskCommentState {
  return {
    commentsMap: {},
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

function createReplyTo(comment: CompleteCommentProps): commentReplyProps {
  return {
    ...comment,
    commentId: comment.id,
    commentedBy: {
      id: comment.user.id ?? "",
      name: comment.user.name,
    },
  };
}
function resolveReply(
  newMap: Record<string, CompleteCommentProps>,
  waitlist: Map<string, string[]>,
  comment: CompleteCommentProps,
) {
  if (!comment.replyToCommentId) return;

  const reply = newMap[comment.replyToCommentId];

  if (reply) {
    newMap[comment.id].replyTo = createReplyTo(reply);
  } else {
    if (!waitlist.has(comment.replyToCommentId)) {
      waitlist.set(comment.replyToCommentId, []);
    }

    waitlist.get(comment.replyToCommentId)?.push(comment.id);
  }
}
function resolveReplyWaitlist(
  newMap: Record<string, CompleteCommentProps>,
  waitlist: Map<string, string[]>,
  comment: CompleteCommentProps,
) {
  const waiting = waitlist.get(comment.id);
  if (!waiting) return;

  waiting.forEach((waitingId) => {
    const waitingComment = newMap[waitingId];
    if (!waitingComment) return;

    waitingComment.replyTo = createReplyTo(comment);
  });

  waitlist.delete(comment.id);
}
