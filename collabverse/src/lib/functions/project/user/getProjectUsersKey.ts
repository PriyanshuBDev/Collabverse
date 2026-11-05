export const getGridProjectUsersKey = (
  workspaceId: string,
  projectId: string,
  taskId?: string,
  search?: string,
) => {
  if (taskId)
    return [
      workspaceId,
      "project",
      projectId,
      taskId,
      "users",
      "grid",
      search ?? "",
    ];

  return [workspaceId, "project", projectId, "users", "grid", search ?? ""];
};
export const getListProjectUserKey = (
  workspaceId: string,
  projectId: string,
  taskId?: string,
  search?: string,
  page?: number,
) => {
  if (taskId)
    return [
      workspaceId,
      "project",
      projectId,
      taskId,
      "users",
      "list",
      search ?? "",
      page,
    ];

  return [
    workspaceId,
    "project",
    projectId,
    "users",
    "list",
    search ?? "",
    page,
  ];
};
