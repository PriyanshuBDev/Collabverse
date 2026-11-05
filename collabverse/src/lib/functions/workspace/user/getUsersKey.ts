export const getGridUsersKey = (
  workspaceId: string,
  projectId?: string,
  taskId?: string,
  search?: string,
) => {
  if (taskId)
    return [
      "worksapce",
      workspaceId,
      projectId,
      taskId,
      "users",
      "grid",
      search ?? "",
    ];

  if (projectId)
    return ["worksapce", workspaceId, projectId, "users", "grid", search ?? ""];

  return ["worksapce", workspaceId, "users", "grid", search ?? ""];
};
export const getListUserKey = (
  workspaceId: string,
  projectId?: string,
  taskId?: string,
  search?: string,
  page?: number,
) => {
  if (taskId)
    return [
      "worksapce",
      workspaceId,
      projectId,
      taskId,
      "users",
      "list",
      search ?? "",
      page,
    ];

  if (projectId)
    return [
      "worksapce",
      workspaceId,
      projectId,
      "users",
      "list",
      search ?? "",
      page,
    ];

  return ["worksapce", workspaceId, "users", "list", search ?? "", page];
};
