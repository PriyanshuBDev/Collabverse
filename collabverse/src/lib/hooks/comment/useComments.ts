import { commentMentions, CompleteCommentProps } from "@/app/interfaces";
import { getComments } from "@/lib/axios/workspace/project/tasks/comments/getComments";
import { markAllCommentsAsRead } from "@/lib/axios/workspace/project/tasks/comments/markAllCommentsAsRead";
import { markCommentAsRead } from "@/lib/axios/workspace/project/tasks/comments/markCommentAsRead";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import {
  createEmptyTask,
  useCommentStore,
} from "@/lib/hooks/zustand/Comments/useTaskCommentStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export function useComments() {
  const { id: currentUserId } = useCurrentUser();
  const { id: projectId } = useCurrentProject();
  const { id: taskId } = useCurrentTask();
  const { id: workspaceId } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const c = useCommentStore((s) => s.tasks[taskId]);
  const task = c ?? createEmptyTask();
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingBottom, setLoadingBottom] = useState(false);
  const olderRestoreCursor = useRef<string | null>(null);
  const newerRestoreCursor = useRef<string | null>(null);
  const [hiddenNewerIds, setHiddenNewerIds] = useState<Set<string> | null>(
    null,
  );
  const hiddenNewerIdsRef = useRef<Set<string> | null>(null);
  const newerFetchLock = useRef(false);
  const updateHiddenNewerIds = useCallback((ids: Set<string> | null) => {
    hiddenNewerIdsRef.current = ids;
    setHiddenNewerIds(ids);
  }, []);
  const [hiddenOlderIds, setHiddenOlderIds] = useState<Set<string> | null>(
    null,
  );
  const hiddenOlderIdsRef = useRef<Set<string> | null>(null);

  const updateHiddenOlderIds = useCallback((ids: Set<string> | null) => {
    hiddenOlderIdsRef.current = ids;
    setHiddenOlderIds(ids);
  }, []);

  const commentsTime = (comments: CompleteCommentProps) =>
    new Date(comments.sentAt ?? comments.createdAt).getTime();

  const compareComments = useCallback(
    (a: CompleteCommentProps, b: CompleteCommentProps) =>
      commentsTime(a) - commentsTime(b) || a.id.localeCompare(b.id),
    [],
  );
  const shouldFetch =
    !task ||
    task.orderedIds.length === 0 ||
    Date.now() - task.lastFetchedAt > 1000 * 60;
  const initTask = useCommentStore((s) => s.initTaskState);

  useEffect(() => {
    if (taskId) {
      initTask(taskId);
    }
  }, [taskId, initTask]);
  const initialQueryKey = [
    workspaceId,
    projectId,
    taskId,
    "comments",
    "comments-initial",
  ];
  const {
    data: initialData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: initialQueryKey,
    queryFn: () =>
      getComments({
        workspaceId,
        projectId,
        taskId,
        mode: "latest",
      }),
    enabled: !!workspaceId && !!projectId && !!taskId && shouldFetch,
  });
  useIsErrorToast(isError, "Failed to fetch comments", error);
  useEffect(() => {
    if (!initialData) return;
    const { upsertComments, setCursors, setWindow } =
      useCommentStore.getState();
    upsertComments(taskId, initialData.comments);
    setCursors(taskId, initialData.topCursor, initialData.bottomCursor);
    const state = useCommentStore.getState();
    const task = state.tasks[taskId];
    if (!task) return;
    setWindow(taskId, task.orderedIds.length - 50, task.orderedIds.length);
  }, [initialData, taskId]);
  const fetchOlder = useCallback(async () => {
    if (loadingTop) return;
    setLoadingTop(true);

    try {
      const state = useCommentStore.getState();
      const current = state.tasks[taskId];
      const topCursor = current.topCursor;
      if (!current || !topCursor) return;
      const res = await queryClient.fetchQuery({
        queryKey: [
          workspaceId,
          projectId,
          taskId,
          "comments",
          "comments-before",
          topCursor,
        ],
        queryFn: () =>
          getComments({
            workspaceId,
            projectId,
            taskId,
            cursor: topCursor,
            mode: "before",
          }),
      });
      const bridgeIds = hiddenOlderIdsRef.current;
      const reachedCachedRange =
        bridgeIds !== null &&
        res.comments.some((comment) => bridgeIds.has(comment.id));

      state.upsertComments(taskId, res.comments);
      state.expandWindowUp(taskId, res.comments.length);
      const latest = useCommentStore.getState().tasks[taskId];
      if (reachedCachedRange || !res.topCursor) {
        updateHiddenOlderIds(null);
        state.setCursors(
          taskId,
          olderRestoreCursor.current,
          latest.bottomCursor,
        );
        olderRestoreCursor.current = null;
      } else {
        state.setCursors(taskId, res.topCursor, latest.bottomCursor);
      }
    } finally {
      setLoadingTop(false);
    }
  }, [
    taskId,
    workspaceId,
    loadingTop,
    queryClient,
    projectId,
    updateHiddenOlderIds,
  ]);
  const fetchNewerPage = useCallback(async () => {
    if (loadingBottom) return;
    setLoadingBottom(true);
    const state = useCommentStore.getState();
    const current = state.tasks[taskId];
    const bottomCursor = current.bottomCursor;
    if (!current || !bottomCursor) return;

    const res = await queryClient.fetchQuery({
      queryKey: [workspaceId, "task", taskId, "comments-after", bottomCursor],
      queryFn: () =>
        getComments({
          workspaceId,
          projectId,
          taskId,
          cursor: bottomCursor,
          mode: "after",
        }),
    });
    const bridgeIds = hiddenNewerIdsRef.current;
    const reachedCachedLatest =
      bridgeIds !== null &&
      res.comments.some((comment) => bridgeIds.has(comment.id));
    const latestState = useCommentStore.getState();
    latestState.upsertComments(taskId, res.comments);
    latestState.expandWindowDown(taskId, res.comments.length);
    if (reachedCachedLatest || !res.bottomCursor) {
      updateHiddenNewerIds(null);
      latestState.setCursors(
        taskId,
        current.topCursor,
        newerRestoreCursor.current,
      );
      newerRestoreCursor.current = null;
      return false;
    }
    latestState.setCursors(taskId, current.topCursor, res.bottomCursor);
    return true;
  }, [
    taskId,
    workspaceId,
    loadingBottom,
    queryClient,
    projectId,
    updateHiddenNewerIds,
  ]);

  const fetchNewer = useCallback(async () => {
    if (newerFetchLock.current) return;
    newerFetchLock.current = true;
    setLoadingBottom(true);
    try {
      await fetchNewerPage();
    } finally {
      newerFetchLock.current = false;
      setLoadingBottom(false);
    }
  }, [fetchNewerPage]);

  const fetchNewerUntilLatest = useCallback(async () => {
    if (newerFetchLock.current) return;

    newerFetchLock.current = true;
    setLoadingBottom(true);

    try {
      while (await fetchNewerPage()) {}
    } finally {
      newerFetchLock.current = false;
      setLoadingBottom(false);
    }
  }, [fetchNewerPage]);
  const jumpToComments = useCallback(
    async (commentId: string) => {
      const state = useCommentStore.getState();

      const res = await queryClient.fetchQuery({
        queryKey: [workspaceId, "task", taskId, "message-around", commentId],
        queryFn: () =>
          getComments({
            workspaceId,
            projectId,
            taskId,
            cursor: commentId,
            mode: "around",
          }),
      });
      if (res?.comments.length > 0) {
        const aroundIds = new Set(
          res.comments.map((comment: CompleteCommentProps) => comment.id),
        );
        const aroundFirst = res.comments.reduce((first, comment) =>
          compareComments(comment, first) < 0 ? comment : first,
        );
        const aroundLast = res.comments.reduce((last, comment) =>
          compareComments(comment, last) > 0 ? comment : last,
        );
        const existing = useCommentStore.getState().tasks[taskId];
        olderRestoreCursor.current = existing.topCursor ?? null;
        newerRestoreCursor.current = existing.bottomCursor ?? null;
        const cachedComments = (existing.orderedIds ?? [])
          .map((id: string) => existing!.commentsMap[id])
          .filter(Boolean);
        const cachedOlderIds = new Set(
          cachedComments
            .filter(
              (comment: CompleteCommentProps) =>
                !aroundIds.has(comment.id) &&
                compareComments(comment, aroundFirst) < 0,
            )
            .map((comment: CompleteCommentProps) => comment.id),
        );

        const cachedNewerIds = new Set(
          cachedComments
            .filter(
              (comment: CompleteCommentProps) =>
                !aroundIds.has(comment.id) &&
                compareComments(comment, aroundLast) > 0,
            )
            .map((comment: CompleteCommentProps) => comment.id),
        );

        updateHiddenOlderIds(cachedOlderIds.size ? cachedOlderIds : null);
        updateHiddenNewerIds(cachedNewerIds.size ? cachedNewerIds : null);
        state.upsertComments(taskId, res.comments);
        state.setCursors(taskId, res.topCursor, res.bottomCursor);
        const updatedTask = useCommentStore.getState().tasks[taskId];
        const index = updatedTask.orderedIds.indexOf(commentId);
        state.setWindow(taskId, index - 25, index + 25);
        return true;
      }
      return false;
    },
    [
      workspaceId,
      taskId,
      queryClient,
      projectId,
      compareComments,
      updateHiddenNewerIds,
      updateHiddenOlderIds,
    ],
  );
  const allComments = task.orderedIds.map((id: string) => task.commentsMap[id]);
  const comments = allComments.filter(
    (comment: CompleteCommentProps) =>
      !hiddenOlderIds?.has(comment.id) && !hiddenNewerIds?.has(comment.id),
  );
  const markAllRead = () =>
    markAllCommentsRead(taskId, workspaceId, currentUserId, projectId);
  const markingRead = useRef(new Set<string>());
  const markAsRead = async (id: string) => {
    if (markingRead.current.has(id)) return;
    markingRead.current.add(id);

    const state = useCommentStore.getState();

    state.updateComments(taskId, id, {
      isReadByMe: true,
    });
    queryClient.setQueryData<commentMentions[]>(
      [workspaceId, projectId, taskId, "comments", "mentions"],
      (oldData: commentMentions[] | undefined) => {
        if (!oldData) return oldData;
        const mentions = oldData.map((m: commentMentions) => {
          return m.commentId === id ? { ...m, seen: true } : m;
        });

        return [...mentions];
      },
    );
    try {
      await markCommentAsRead({
        workspaceId,
        taskId,
        projectId,
        commentId: id,
      });
    } catch (e) {
      console.error(e);
      state.updateComments(taskId, id, {
        isReadByMe: false,
      });
    }
  };
  const showCachedLatest = () => {
    updateHiddenNewerIds(null);

    const current = useCommentStore.getState().tasks[taskId];
    if (current && newerRestoreCursor.current !== null) {
      useCommentStore
        .getState()
        .setCursors?.(taskId, current.topCursor, newerRestoreCursor.current);
    }

    newerRestoreCursor.current = null;
  };
  return {
    comments,
    loadingBottom,
    loadingTop,
    jumpToComments,
    isLoading,
    markAsRead,
    markAllRead,
    hasOlder: !!task.topCursor,
    hasNewer: !!task.bottomCursor,
    fetchOlder,
    fetchNewerUntilLatest,
    fetchNewer,
    showCachedLatest,
  };
}
export const markAllCommentsRead = async (
  taskId: string,
  workspaceId: string,
  userId: string,
  projectId: string,
) => {
  const state = useCommentStore.getState();
  const task = state.tasks[taskId];
  const comments = task.orderedIds.map((id: string) => task.commentsMap[id]);
  const unReads = comments
    .filter((m: CompleteCommentProps) => m.user.id !== userId && !m.isReadByMe)
    .map((m: CompleteCommentProps) => m.id);
  unReads.forEach((id: string) =>
    state.updateComments(taskId, id, {
      isReadByMe: true,
    }),
  );
  try {
    await markAllCommentsAsRead({
      workspaceId,
      projectId,
      taskId,
    });
  } catch (e) {
    console.error(e);
  }
};
