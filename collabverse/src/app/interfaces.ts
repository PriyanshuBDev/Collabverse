import { projectRoleChange } from "@/lib/axios/workspace/project/users/roleChangeProjectUser";
import {
  ActivityType,
  CallStatus,
  CallType,
  ChatListType,
  ConvMemberStatus,
  Doors,
  GroupPerm,
  GroupRole,
  InvitationRole,
  InvitationStatus,
  MessageType,
  MuteEnum,
  NotificationType,
  PlayerEmote,
  PPermission,
  Priority,
  Prisma,
  PRole,
  TaskRole,
  TaskStatus,
  Theme,
  WsRole,
} from "@prisma/client";
import z from "zod";

export interface basicMember {
  id: string;
  name: string;
  avatar?: string;
}
export interface basicFormerMember {
  id?: string;
  name: string;
  avatar?: string;
}
export interface memberProps extends basicMember {
  username: string;
}
export interface memberAndRoleProps extends memberProps {
  role: string;
}
export interface wsMembersProps extends memberProps {
  role: WsRole;
}
export interface ProjectMembersProps extends memberProps {
  role: PRole;
}

export interface ProjectCardProps {
  id: string;
  name: string;
  avatar?: string;
  totalTasks: number;
  completedTasks: number;
  description?: string;
  members: number;
  createdAt: Date;
  dueDate?: Date;
  owner: memberProps;
  slug: string;
}
export interface MembersProjectProps {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  joinedAt: Date;
  tasks: {
    id: string;
    name: string;
    role: string;
    status: string;
  };
}
export type allRole = WsRole | PRole | TaskRole;
export interface wsUserProps {
  name: string;
  id: string;
  avatar?: string;
  username: string;
  role: allRole;
  projects?: number;
  tasks?: number;
  joinedAt: Date;
  ownedProjects?: number;
  assignedTasksInProject?: number;
}
export interface completeMembersProps {
  name: string;
  id: string;
  avatar?: string;
  username: string;
  wsRole: WsRole;
  projects: number;
  tasks: number;
  joinedAt: Date;
}

export interface commentReactionProps {
  emoji: string;
  reactedBy: string[];
}

export interface taskCommentProps {
  id: string;
  commentedBy: memberProps;
  comment: string;
  createdAt: Date;
  reactions: commentReactionProps[];
  replyTo?: commentReplyProps;
  mentions?: mentionProps[];
  pinIdx?: number;
  readBy: string[];
  sentAt?: Date;
  isDeletedForMe: boolean;
  isDeleted: boolean;
}

export interface activityAffectedUserProps {
  id?: string;
  name?: string;
}

export interface activityProps {
  id: string;
  user: basicFormerMember;
  affectedUser?: activityAffectedUserProps;
  type: ActivityType;
  target?: ActivityTarget | null;
  workspaceId?: string;
  projectId?: string;
  taskId?: string;
  meta?: Record<string, string | undefined>;
  createdAt: Date;
}

export interface ActivityTarget {
  id?: string;
  name?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface subTaskProps {
  id: string;
  done: boolean;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: basicFormerMember;
  markedBy?: basicFormerMember;
}
export interface projectProps {
  id: string;
  name: string;
  avatar?: string;
  slug: string;
}
export interface taskProps {
  id: string;
  name: string;
  slug: string;
  due: Date;
  createdAt: Date;
  priority: Priority;
  createdBy: basicFormerMember;
  status: TaskStatus;
  description?: string;
  subtasks: subTaskProps[];
  totalMembers: number;
}
export type taskAuthority = TaskRole | "High";
export interface viewTasksProps {
  id: string;
  slug: string;
  name: string;
  dueDate: Date;
  createdAt: Date;
  priority: Priority;
  position: number;
  members: basicMember[];
  attachments?: number;
  comments?: number;
  totalMembers: number;
  status: TaskStatus;
  description?: string;
  totalSubtasks: number;
  doneSubtasks: number;
  currentUserTaskRole?: taskAuthority;
}
export interface searchTaskProps {
  id: string;
  slug: string;
  name: string;
  dueDate: Date;
  createdAt: Date;
  priority: Priority;
  position: number;
  members: basicMember[];
  attachments?: number;
  comments?: number;
  totalMembers: number;
  status: TaskStatus;
  description?: string;
  totalSubtasks: number;
  doneSubtasks: number;
  currentUserTaskRole?: taskAuthority;
  projectRole: projectAuthorityRole;
  projectSlug: string;
}

export interface ChatProps {
  id: string;
  message: string;
  createdAt?: Date;
  sentAt?: Date;
  seenAt?: Date | null;
  editedAt?: Date;
  deleterFor: string[];
  isDeleted: boolean;
  user: memberProps;
}
export interface chatPins {
  id: string;
  message: MessagePreview;
  messageId: string;
  pinnedById: string;
  pinnedAt: Date;
  isDeletedForUser: boolean;
}
export interface MessagePreview {
  type: MessageType;
  message?: string;
  name?: string;
  duration?: number;
}
export interface chatPinProps {
  id: string;
  type: MessageType;
  message?: string;
  createdAt: Date;
  sentAt?: Date;
  editedAt?: Date | null;
  isDeletedForUser: boolean;
  isReadByMe: boolean;
  isRead: boolean;
  isDeleted: boolean;
  isForwarded: boolean;
  user: basicFormerMember;
  reactions: commentReactionProps[];
  replyTo?: chatReplyProps;
  media: chatMediaProps[];
  pinnedAt: Date;
  pinnedBy: basicFormerMember;
}
export interface chatPinResProps {
  pins: chatPinProps[];
  nextCursor: cursorProps | null;
  hasMore: boolean;
}
export interface GroupHeaderProps {
  id: string;
  avatar?: string;
  name: string;
  permissions?: GroupPerm[];
  members: memberProps[];
  currentUserStatus?: ConvMemberStatus;
}
export interface mentionedUserProps {
  userId: string;
  seen: boolean;
  name: string;
}
export interface mentionProps {
  id: string;
  messageId: string;
  userId: string;
  seen: boolean;
  date: Date;
}
export interface convoDetailsProps {
  conversationId: string;
  lastClearedAt?: Date;
  pins: chatPins[];
  mentions: mentionProps[];
  header: GroupHeaderProps;
  role?: GroupRole;
}
export interface chatReplyProps {
  chatId: string;
  type: MessageType;
  name?: string;
  message?: string;
  duration?: number;
  messagedBy: {
    id?: string;
    name: string;
  };
}
export interface commentReplyProps {
  commentId: string;
  comment: string;
  commentedBy: {
    id?: string;
    name: string;
  };
}
export interface commentMentions {
  id: string;
  commentId: string;
  seen: boolean;
  mentionedUserId: string;
  createdAt: Date;
}
export type ReplyPreview = {
  id: string;
  sender: {
    id?: string;
    name: string;
  };
  type: MessageType;

  content?: string;

  media?: {
    name: string;
    duration?: number;
  };
  call?: {
    status: CallStatus;
    duration?: number;
  };
};
export interface chatMediaProps {
  name: string;
  id: string;
  path?: string;
  format: string;
  type: string;
  bytes: number;
  duration?: number;
  url?: string;
  order: number;
}
export type uploadStatusType = "uploading" | "failed" | "sent" | "processing";
export type callSessionProps = {
  status: CallStatus;
  id: string;
  startedAt: Date | null;
  endedAt: Date | null;
  type: CallType;
};
export interface CompleteChatProps {
  id: string;
  type: MessageType;
  message?: string;
  createdAt: Date;
  sentAt?: Date;
  seenAt?: Date | null;
  deliveredAt?: Date | null;
  editedAt?: Date | null;
  isDeletedForUser: boolean;
  isDeleted: boolean;
  isForwarded: boolean;
  user: basicFormerMember;
  sending?: {
    status: uploadStatusType;
    progress: number;
  };
  isRead: boolean;
  isReadByMe: boolean;
  reactions: commentReactionProps[];
  replyTo?: chatReplyProps;
  replyToMsgId?: string;
  media: chatMediaProps[];
  isPinned: boolean;
  call?: callSessionProps;
}
export type CompleteCommentProps = {
  id: string;
  comment: string;
  createdAt: Date;
  sentAt: Date;
  user: basicFormerMember;
  isReadByMe: boolean;
  replyTo?: commentReplyProps;
  replyToCommentId?: string;
  reactions: commentReactionProps[];
};
export interface rawChatProps {
  id: string;
  type: MessageType;
  message?: string;
  createdAt: Date;
  user: basicFormerMember;
  sending?: {
    status: uploadStatusType;
    progress: number;
  };
  replyTo?: chatReplyProps;
  media: File[];
  mentions: string[];
}
export interface chatListLastMsg {
  type: MessageType;
  id: string;
  message?: string;
  name?: string;
  callStatus?: CallStatus;
  duration?: number;
  createdAt?: Date;
  sentAt?: Date;
  isRead: boolean;
  isReadByMe: boolean;
  editedAt?: Date | null;
  isDeletedForUser: boolean;
  isDeleted: boolean;
  messagedBy: {
    id?: string;
    name: string;
  };
}
export interface chatListProps {
  id: string;
  type: ChatListType;
  name: string;
  avatar?: string;
  membership?: ConvMemberStatus;
  lastMessage?: chatListLastMsg;
  unread: number;
  pinIdx?: number;
  mute?: MuteEnum;
  mutedAt?: Date;
  lastActivityAt: Date;
}
export interface groupUsersProps extends memberProps {
  role: GroupRole;
}
export interface groupPermissions {
  editGroupSettings: boolean;
  sendMsgs: boolean;
  pin: boolean;
  sendFiles: boolean;
}
export interface GroupData {
  id: string;
  name: string;
  avatar?: string;
  avatarPath?: string;
  description?: string;
  createdAt: Date;
  currentUserRole?: GroupRole;
  totalMembers: number;
  mute?: MuteEnum;
  mutedAt?: Date;
  createdBy: basicFormerMember;
  permissions: GroupPerm[];
  currentUserStatus: ConvMemberStatus;
}
export interface DmUserData {
  id: string;
  name: string;
  avatar?: string;
  username: string;
  createdAt: Date;
  mute?: MuteEnum;
  mutedAt?: Date;
  lastSeenAt?: Date;
}

export interface userData extends memberProps {
  mute?: string;
  mutedAt?: Date;
}

export interface chatMentionProps {
  id: string;
  mentions: mentionProps[];
  date: Date;
}

export interface selectedMsgsProps {
  msgId: string;
}
export interface selectedConvosProps {
  convoId: string;
}

export interface userDetails extends memberProps {
  mute: boolean;
  theme: Theme;
}
export interface WorkspacesProps {
  id: string;
  name: string;
  avatar?: string;
  slug: string;
  createdAt: Date;
  members: number;
  description?: string;
  projects: number;
  owner: {
    id: string;
    avatar?: string;
    name: string;
  };
}

export type searchDataProps =
  | { type: "Task"; data: taskProps[] }
  | { type: "Project"; data: ProjectCardProps[] }
  | { type: "User"; data: wsUserProps[] }
  | { type: "Workspace"; data: WorkspacesProps[] };
export interface projContributorsPerm {
  comment: boolean;
  canInvite: boolean;
}
export interface projManagersPerm {
  canRemoveMem: boolean;
  canInvite: boolean;
  canChangeDetails: boolean;
}
export interface projViewersPerm {
  comment: boolean;
}
export interface projectPermissions {
  contributor: projContributorsPerm;
  viewer: projViewersPerm;
  manager: projManagersPerm;
}
export interface ProjectSettingsProps {
  id: string;
  name: string;
  avatar?: string;
  avatarPath?: string;
  totalTasks: number;
  completedTasks: number;
  createdAt: Date;
  createdBy: memberProps;
  owner: memberProps;
  currentUser?: {
    role: projectAuthorityRole;
    joinedAt: Date;
  };
  permissions: projectPermissions;
}
export type wsMemberPerm = "Invite" | "Create_Project";
export type wsAdminPerm =
  | "Invite"
  | "Create_Project"
  | "Approve_Join"
  | "Remove_Member"
  | "Edit_Ws_Details"
  | "Delete_Project";
export type wsPermissionState = {
  member: wsMemberPerm[];
  admin: wsAdminPerm[];
};
export interface WorkspaceSettingsProps {
  id: string;
  name: string;
  avatar?: string;
  avatarPath?: string;
  description?: string;
  owner: basicMember;
  creator: basicFormerMember;
  createdAt: Date;
  permissions: wsPermissionState;
  currentUser: {
    id: string;
    name: string;
    username: string;
    role: WsRole;
    joinedAt: Date;
    projectCount: number;
  };
}
export interface userApprovalProps extends memberProps {
  role: InvitationRole;
}
export interface invitedByApprovalProps {
  id: string | null;
  name: string | null;
  avatar?: string | null;
}
export interface approvalReqProps {
  id: string;
  user: userApprovalProps;
  invitedBy: invitedByApprovalProps;
  createdAt: Date;
}

export interface themeProps {
  theme: "Dark" | "Light" | "Default";
}

export interface UserDataProps {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar?: string;
  avatarPath?: string;
  email: string;
  theme: "Dark" | "Light" | "Default";
  mute: boolean;
  twoFA: boolean;
  createdAt: Date;
  wsCount: number;
  appearance: CharacterAppearance;
}
export interface UserDeleteAccountProps {
  wsCount: number;
  projCount: number;
  email: string;
  id: string;
}

export interface notificationProps {
  id: string;
  sender: basicFormerMember;
  type: NotificationType;
  target?: NotificationTarget;
  meta?: Record<string, string | undefined>;
  workspace?: wsProps;
  createdAt: Date;
}
export interface notificationResProps {
  notifications: notificationProps[];
  nextCursor: cursorProps | null;
  hasMore: boolean;
}
export interface NotificationTarget {
  id?: string;
  name?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface wsProps {
  id: string;
  name: string;
  avatar?: string;
  slug: string;
}

export interface createWsProps {
  name: string;
  description?: string;
  avatar?: File | null;
}

export interface ZodErrorResponse {
  errors: {
    [key: string]: string[] | undefined;
  };
}

export interface editProfileResponse {
  name: string;
  username: string;
  bio: string;
}

export interface editedUserProps {
  name: string;
  username: string;
  bio: string;
  avatar?: string;
  avatarPath?: string;
}

export interface cursorProps {
  cursorCreatedAt: Date;
  cursorId: string;
}
export interface dueDateCursorProps {
  cursorDueDate: Date;
  cursorId: string;
}
export interface activityResponse {
  activities: activityProps[];
  nextCursor: cursorProps | null;
  hasMore: boolean;
}

export const DeletableAvatarTypeSchema = z.enum([
  "users",
  "groups",
  "projects",
  "workspaces",
]);

export type DeletableAvatarType = z.infer<typeof DeletableAvatarTypeSchema>;
export interface upcomingTasksProps {
  id: string;
  name: string;
  slug: string;
  status: TaskStatus;
  dueDate: Date;
  createdAt: Date;
}

export interface wsSummaryProps {
  title: string;
  value: number;
}
export type Tier = "Workspace" | "Project" | "Task";
export interface wsUserResPropsGrid {
  users: wsUserProps[];
  nextCursor: string | null;
  hasMore: boolean;
  type: Tier;
}
export interface wsUserResPropsList {
  users: wsUserProps[];
  limit: number;
  page: number;
  total: number;
  type: Tier;
}

export interface usersProjFilterProps {
  id: string;
  name: string;
  avatar?: string;
  role?: PRole;
  managerPerms?: PPermission[];
  tasks: {
    id: string;
    name: string;
  }[];
}
export const projInviteRolesConst = [
  PRole.Manager,
  PRole.Contributor,
  PRole.Viewer,
] as const;
export type projectInviteAllowedRoles = (typeof projInviteRolesConst)[number];
export interface projectInvitedUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role: projectInviteAllowedRoles;
}
export interface wsJoinRequestsProps {
  requests: approvalReqProps[];
  total: number;
  limit: number;
  page: number;
}

export type projectAuthorityRole = PRole | "High";
export type projectManagerPerm =
  | "Remove_Member"
  | "Invite"
  | "Edit_Project_Details";
export type projectContributorPerm = "Invite" | "Comment";
export type projectViewerPerm = "Comment";

export interface CompleteProjectProps {
  id: string;
  name: string;
  avatar?: string;
  avatarPath?: string;
  totalTasks: number;
  completedTasks: number;
  description?: string;
  createdAt: Date;
  dueDate: Date | null;
  owner: memberProps;
  createdBy: memberProps;
  slug: string;
  members: memberProps[];
  totalMembers: number;
}

export interface taskMembersProps extends memberProps {
  role: TaskRole;
}
export type projectBasedRole = PRole | TaskRole;
export interface projectUserProps {
  name: string;
  id: string;
  avatar?: string;
  username: string;
  role: projectBasedRole;
  tasks?: number;
  joinedAt: Date;
  assignedTasksInProject?: number;
}
export type projectBasedTier = "Project" | "Task";
export interface projectUserResPropsGrid {
  users: projectUserProps[];
  nextCursor: string | null;
  hasMore: boolean;
  type: projectBasedTier;
}
export interface basicProject {
  id: string;
  name: string;
  avatar?: string;
}
export interface projectUserResPropsList {
  users: projectUserProps[];
  limit: number;
  page: number;
  total: number;
  type: projectBasedTier;
}
export interface usersTaskFilterProps {
  id: string;
  name: string;
}

export interface taskTableProps {
  tasks: viewTasksProps[];
  limit: number;
  page: number;
  total: number;
}
export interface taskBoardProps {
  tasks: viewTasksProps[];
  hasMore: boolean;
}
export interface taskCalendarProps {
  tasks: viewTasksProps[];
}

export interface ColumnProps {
  id: TaskStatus;
  tasks: viewTasksProps[];
}

export interface statusAndPermsProps {
  status: TaskStatus;
  permission: {
    canDrop: boolean;
    canDrag: boolean;
  };
}
export type BoardState = {
  [status in TaskStatus]: {
    tasks: viewTasksProps[];
    hasMore: boolean;
  };
};
export interface taskCreateUsersProps {
  id: string;
  role: TaskRole;
}

export interface taskFilterProjectProps {
  id: string;
  name: string;
  avatar?: string;
  slug: string;
  role: projectAuthorityRole;
}

export interface idAndSlug {
  id: string;
  slug: string;
}

export interface currentTaskProps {
  id: string;
  name: string;
  slug: string;
  role: taskAuthority;
}
export interface taskEditProps {
  name?: string;
  description?: string | null;
  dueDate?: Date;
  priority?: Priority;
  status?: TaskStatus;
}
export interface taskEditResProps {
  name: string;
  description?: string;
  dueDate: Date;
  priority: Priority;
  status: TaskStatus;
}
export interface taskUserProps extends taskMembersProps {
  joinedAt: Date;
}
export interface taskUserResProps {
  users: taskUserProps[];
  nextCursor: string | null;
  hasMore: boolean;
}
export interface projectFilteredUsersResProps {
  users: ProjectMembersProps[];
  nextCursor: string | null;
  hasMore: boolean;
}
export interface fileMeta {
  id: string;
  file: File;
}
export interface fileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  path: string;
  type: string;
  size: number;
  format: string;
}
export interface attachmentProps extends fileMetadata {
  id: string;
  attachedBy: basicFormerMember;
  createdAt: Date;
}
export interface getAttachmentsRes {
  attachments: attachmentProps[];
  nextCursor: {
    cursorId: string;
    cursorCreatedAt: Date;
  } | null;
  hasMore: boolean;
}
export interface wsUsersForInviteResProps {
  users: memberProps[];
  nextCursor: string | null;
  hasMore: boolean;
}
export interface projectInviteUserProps {
  id: string;
  role: projectRoleChange;
}

export interface basicWsDetails {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  owner: basicMember;
  members: number;
}

export interface basicProjectDetails {
  id: string;
  name: string;
  avatar?: string;
  slug: string;
  description?: string;
  owner: basicMember;
  members: number;
}
export interface wsInvitationProps {
  id: string;
  expireAt?: Date;
  invitedBy: basicFormerMember;
  status: InvitationStatus;
  available: number | null;
  workspace: basicWsDetails;
  role: InvitationRole;
}

export interface projectInvitationProps {
  id: string;
  expireAt?: Date;
  project: basicProjectDetails;
  status: InvitationStatus;
  role: InvitationRole;
  invitedBy: basicFormerMember;
}
export interface inviteUsersToProjectProps {
  id: string;
  userId: string;
  role: projectRoleChange;
}

export interface userInvitationsProps {
  id: string;
  expireAt?: Date;
  invitedBy: basicFormerMember;
  workspace?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    id: string;
    name: string;
    avatar?: string;
  };
  role: InvitationRole;
  createdAt: Date;
  available: number | null;
}
export interface createGroupUserProps {
  id: string;
  role: GroupRole;
}
export interface usersToAddGroupResProps {
  users: memberProps;
  nextCursor: string | null;
  hasMore: boolean;
}
export interface currentConversationProps {
  id: string;
  type: ChatListType;
}
export interface allConversationResProps {
  id: string;
  users: memberProps[];
  convo: { type: "Dm" } | { type: "Group"; status: ConvMemberStatus };
}
export interface upcomingTasksResProps {
  items: upcomingTasksProps[];
  nextCursor: dueDateCursorProps | null;
  hasMore: boolean;
}
export type eventType = "INSERT" | "UPDATE" | "DELETE";
export interface getGroupUsersResProps {
  users: groupUsersProps[];
  hasMore: boolean;
  nextCursor: string | null;
}
export interface getMessagesResProps {
  messages: CompleteChatProps[];
  topCursor: string | null;
  bottomCursor: string | null;
  hasOlder: boolean;
  hasNewer: boolean;
}
export interface getCommentsResProps {
  comments: CompleteCommentProps[];
  topCursor: string | null;
  bottomCursor: string | null;
  hasOlder: boolean;
  hasNewer: boolean;
}
export type msgDataFileForApi = {
  url?: string;
  fileName: string;
  path: string;
  format: string;
  type: string;
  originalName: string;
  size: number;
  duration: number | null;
};
export type msgDataForApi = {
  clientId: string;
  type: MessageType;
  replyToMessageId: string | null;
  content: string | null;
  mentions: string[];
  files: msgDataFileForApi[];
  createdAt: Date;
};
export type commentDataForApi = {
  clientId: string;
  replyToCommentId: string | null;
  comment: string;
  mentions: string[];
  createdAt: Date;
};
export enum CallState {
  IDLE,
  CALLING,
  RINGING,
  CONNECTING,
  CONNECTED,
  ENDED,
}
export type signalType =
  | "incoming_call"
  | "offer"
  | "answer"
  | "ice_candidate"
  | "accept"
  | "reject"
  | "hangup"
  | "busy"
  | "mute"
  | "camera_toggle"
  | "screen_share"
  | "cancel";
export type callMode = "Voice" | "Video";
export interface SignalMessage {
  callId: string;
  type: signalType;

  from: string;

  to: string;

  conversationId: string;
  mode: callMode;
  payload?: unknown;
}
export type CallEndReason =
  | "Rejected"
  | "Busy"
  | "Timeout"
  | "Cancelled"
  | "Ended"
  | "Failed";
export type homeProps = {
  activeProjects: number;
  activeProjectsIncreasedBy: number;
  completedTasks: number;
  totalTasks: number;
  userAppearance: CharacterAppearance;
  tasks: {
    id: string;
    name: string;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date;
    slug: string;
    project: {
      name: string;
      slug: string;
    };
  }[];
  randomProjectSlug: string;
};
export type userIdProp = { userId: string };
export type workspaceMemberProp = {
  workspaceMember: {
    user: {
      name: string | null;
      id: string;
      avatar: string | null;
      username: string | null;
    };
  };
};
export type prismaProMemProp = {
  projectMember: {
    workspaceMember: {
      user: {
        id: string;
        name: string | null;
        avatar: string | null;
        username: string | null;
      };
    };
  };
};
export type dataWithSlug = {
  id: string;
  name: string;
  avatar: string | null;
  slug: string;
};
export type wsMemberUserIdProp = {
  workspaceMemberUserId: string;
};
export type projMemberUserIdProp = {
  projectMemberUserId: string;
};
export type pathProp = {
  path: string;
};
export type prismaUserProp = {
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
    username: string | null;
  };
};
export type prismaUserPropShort = {
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
};
export type prismaTransactionProp = Prisma.TransactionClient;
export interface userCommonProjectProps {
  id: string;
  name: string;
  avatar?: string;
  slug: string;
  role: PRole;
}
export interface userCommonGroups {
  id: string;
  name: string;
  avatar?: string;
  role: GroupRole;
}
export interface fullUserDetails {
  id: string;
  name: string;
  avatar?: string;
  username: string;
  projects: userCommonProjectProps[];
  lastSeenAt?: Date;
  appearance: CharacterAppearance;
  groups: userCommonGroups[];
}
export interface TiledTileset {
  firstgid: number;
  name: string;
  image?: string;

  imagewidth?: number;
  imageheight?: number;

  tilewidth: number;
  tileheight: number;

  tilecount?: number;
  columns?: number;

  margin?: number;
  spacing?: number;
  tiles?: {
    id: number;
    animation?: {
      tileid: number;
      duration: number;
    }[];
  }[];
}
export interface TiledLayer {
  name: string;
  type: string;
  layers?: TiledLayer[];
  objects?: TiledObject[];
}

export interface TiledMapData {
  tilesets: TiledTileset[];
  layers: TiledLayer[];
}
export interface TiledProperty {
  name: string;
  type: string;
  value: string | number | boolean;
}
export interface TiledObject {
  id: number;
  gid?: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  visible?: boolean;
  properties?: TiledProperty[];
  sprite: Phaser.GameObjects.Sprite;
  [key: string]: unknown;
}

export interface TiledObjectLayer extends TiledLayer {
  objects?: TiledObject[];
}
export interface fullUserAppearance {
  playerId: string;
  name: string;
  username: string;
  avatar?: string;
  appearance: CharacterAppearance;
  dnd: boolean;
  musicLevel: number;
}
export type WorldPlayer = {
  playerId: string;
  name: string;
  username: string;
  avatar?: string;
  appearance: CharacterAppearance;
  dnd: boolean;
  inCall: boolean;
};
export interface CharacterAppearance {
  body: string;
  eyes: string;
  hairstyle: string;
  accessory: string | null;
  outfit: string;
}

export type PlayerMovement = {
  playerId: string;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  moving: boolean;
  sequence?: number;
};
export interface PositionSnapshotRequest {
  requestId: string;
  requesterId: string;
}

export interface PositionSnapshotResponse extends PlayerMovement {
  requestId: string;
  to: string;
}
export type PlayerEmoteEvent = {
  playerId: string;
  emote: PlayerEmote;
  eventId: string;
};

export type DoorEvent = {
  doorId: Doors;
  isOpen: boolean;
};
export type CallSpace = "Workspace" | "Flowspace";
export type bodyId =
  | "body-01"
  | "body-02"
  | "body-03"
  | "body-04"
  | "body-05"
  | "body-06"
  | "body-07"
  | "body-08"
  | "body-09";
export type eyesId =
  | "eyes-01"
  | "eyes-02"
  | "eyes-03"
  | "eyes-04"
  | "eyes-05"
  | "eyes-06"
  | "eyes-07";
export type accessoryId =
  | "accessory-01"
  | "accessory-02"
  | "accessory-03"
  | "accessory-04"
  | "accessory-05"
  | "accessory-06"
  | "accessory-07"
  | "accessory-08"
  | "accessory-09"
  | "accessory-10"
  | "accessory-11"
  | "accessory-12"
  | "accessory-13"
  | "accessory-14"
  | "accessory-15"
  | "accessory-16"
  | "accessory-17"
  | "accessory-18"
  | "accessory-19"
  | "accessory-20"
  | "accessory-21"
  | "accessory-22"
  | "accessory-23"
  | "accessory-24"
  | "accessory-25"
  | "accessory-26"
  | "accessory-27"
  | "accessory-28"
  | "accessory-29"
  | "accessory-30"
  | "accessory-31"
  | "accessory-32"
  | "accessory-33"
  | "accessory-34"
  | "accessory-35"
  | "accessory-36"
  | "accessory-37"
  | "accessory-38"
  | "accessory-39"
  | "accessory-40"
  | "accessory-41"
  | "accessory-42"
  | "accessory-43"
  | "accessory-44"
  | "accessory-45"
  | "accessory-46"
  | "accessory-47"
  | "accessory-48"
  | "accessory-49"
  | "accessory-50"
  | "accessory-51"
  | "accessory-52"
  | "accessory-53"
  | "accessory-54"
  | "accessory-55"
  | "accessory-56"
  | "accessory-57"
  | "accessory-58"
  | "accessory-59"
  | "accessory-60"
  | "accessory-61"
  | "accessory-62"
  | "accessory-63"
  | "accessory-64"
  | "accessory-65"
  | "accessory-66"
  | "accessory-67"
  | "accessory-68"
  | "accessory-69"
  | "accessory-70"
  | "accessory-71"
  | "accessory-72"
  | "accessory-73"
  | "accessory-74"
  | "accessory-75"
  | "accessory-76"
  | "accessory-77"
  | "accessory-78"
  | "accessory-79"
  | "accessory-80"
  | "accessory-81"
  | "accessory-82"
  | "accessory-83"
  | "accessory-84"
  | "accessory-85";

export type hairstyleId =
  | "hairstyle-01"
  | "hairstyle-02"
  | "hairstyle-03"
  | "hairstyle-04"
  | "hairstyle-05"
  | "hairstyle-06"
  | "hairstyle-07"
  | "hairstyle-08"
  | "hairstyle-09"
  | "hairstyle-10"
  | "hairstyle-11"
  | "hairstyle-12"
  | "hairstyle-13"
  | "hairstyle-14"
  | "hairstyle-15"
  | "hairstyle-16"
  | "hairstyle-17"
  | "hairstyle-18"
  | "hairstyle-19"
  | "hairstyle-20"
  | "hairstyle-21"
  | "hairstyle-22"
  | "hairstyle-23"
  | "hairstyle-24"
  | "hairstyle-25"
  | "hairstyle-26"
  | "hairstyle-27"
  | "hairstyle-28"
  | "hairstyle-29"
  | "hairstyle-30"
  | "hairstyle-31"
  | "hairstyle-32"
  | "hairstyle-33"
  | "hairstyle-34"
  | "hairstyle-35"
  | "hairstyle-36"
  | "hairstyle-37"
  | "hairstyle-38"
  | "hairstyle-39"
  | "hairstyle-40"
  | "hairstyle-41"
  | "hairstyle-42"
  | "hairstyle-43"
  | "hairstyle-44"
  | "hairstyle-45"
  | "hairstyle-46"
  | "hairstyle-47"
  | "hairstyle-48"
  | "hairstyle-49"
  | "hairstyle-50"
  | "hairstyle-51"
  | "hairstyle-52"
  | "hairstyle-53"
  | "hairstyle-54"
  | "hairstyle-55"
  | "hairstyle-56"
  | "hairstyle-57"
  | "hairstyle-58"
  | "hairstyle-59"
  | "hairstyle-60"
  | "hairstyle-61"
  | "hairstyle-62"
  | "hairstyle-63"
  | "hairstyle-64"
  | "hairstyle-65"
  | "hairstyle-66"
  | "hairstyle-67"
  | "hairstyle-68"
  | "hairstyle-69"
  | "hairstyle-70"
  | "hairstyle-71"
  | "hairstyle-72"
  | "hairstyle-73"
  | "hairstyle-74"
  | "hairstyle-75"
  | "hairstyle-76"
  | "hairstyle-77"
  | "hairstyle-78"
  | "hairstyle-79"
  | "hairstyle-80"
  | "hairstyle-81"
  | "hairstyle-82"
  | "hairstyle-83"
  | "hairstyle-84"
  | "hairstyle-85"
  | "hairstyle-86"
  | "hairstyle-87"
  | "hairstyle-88"
  | "hairstyle-89"
  | "hairstyle-90"
  | "hairstyle-91"
  | "hairstyle-92"
  | "hairstyle-93"
  | "hairstyle-94"
  | "hairstyle-95"
  | "hairstyle-96"
  | "hairstyle-97"
  | "hairstyle-98"
  | "hairstyle-99"
  | "hairstyle-100"
  | "hairstyle-101"
  | "hairstyle-102"
  | "hairstyle-103"
  | "hairstyle-104"
  | "hairstyle-105"
  | "hairstyle-106"
  | "hairstyle-107"
  | "hairstyle-108"
  | "hairstyle-109"
  | "hairstyle-110"
  | "hairstyle-111"
  | "hairstyle-112"
  | "hairstyle-113"
  | "hairstyle-114"
  | "hairstyle-115"
  | "hairstyle-116"
  | "hairstyle-117"
  | "hairstyle-118"
  | "hairstyle-119"
  | "hairstyle-120"
  | "hairstyle-121"
  | "hairstyle-122"
  | "hairstyle-123"
  | "hairstyle-124"
  | "hairstyle-125"
  | "hairstyle-126"
  | "hairstyle-127"
  | "hairstyle-128"
  | "hairstyle-129"
  | "hairstyle-130"
  | "hairstyle-131"
  | "hairstyle-132"
  | "hairstyle-133"
  | "hairstyle-134"
  | "hairstyle-135"
  | "hairstyle-136"
  | "hairstyle-137"
  | "hairstyle-138"
  | "hairstyle-139"
  | "hairstyle-140"
  | "hairstyle-141"
  | "hairstyle-142"
  | "hairstyle-143"
  | "hairstyle-144"
  | "hairstyle-145"
  | "hairstyle-146"
  | "hairstyle-147"
  | "hairstyle-148"
  | "hairstyle-149"
  | "hairstyle-150"
  | "hairstyle-151"
  | "hairstyle-152"
  | "hairstyle-153"
  | "hairstyle-154"
  | "hairstyle-155"
  | "hairstyle-156"
  | "hairstyle-157"
  | "hairstyle-158"
  | "hairstyle-159"
  | "hairstyle-160"
  | "hairstyle-161"
  | "hairstyle-162"
  | "hairstyle-163"
  | "hairstyle-164"
  | "hairstyle-165"
  | "hairstyle-166"
  | "hairstyle-167"
  | "hairstyle-168"
  | "hairstyle-169"
  | "hairstyle-170"
  | "hairstyle-171"
  | "hairstyle-172"
  | "hairstyle-173"
  | "hairstyle-174"
  | "hairstyle-175"
  | "hairstyle-176"
  | "hairstyle-177"
  | "hairstyle-178"
  | "hairstyle-179"
  | "hairstyle-180"
  | "hairstyle-181"
  | "hairstyle-182"
  | "hairstyle-183"
  | "hairstyle-184"
  | "hairstyle-185"
  | "hairstyle-186"
  | "hairstyle-187"
  | "hairstyle-188"
  | "hairstyle-189"
  | "hairstyle-190"
  | "hairstyle-191"
  | "hairstyle-192"
  | "hairstyle-193"
  | "hairstyle-194"
  | "hairstyle-195"
  | "hairstyle-196"
  | "hairstyle-197"
  | "hairstyle-198"
  | "hairstyle-199"
  | "hairstyle-200";
export type outfitId =
  | "outfit-01"
  | "outfit-02"
  | "outfit-03"
  | "outfit-04"
  | "outfit-05"
  | "outfit-06"
  | "outfit-07"
  | "outfit-08"
  | "outfit-09"
  | "outfit-10"
  | "outfit-11"
  | "outfit-12"
  | "outfit-13"
  | "outfit-14"
  | "outfit-15"
  | "outfit-16"
  | "outfit-17"
  | "outfit-18"
  | "outfit-19"
  | "outfit-20"
  | "outfit-21"
  | "outfit-22"
  | "outfit-23"
  | "outfit-24"
  | "outfit-25"
  | "outfit-26"
  | "outfit-27"
  | "outfit-28"
  | "outfit-29"
  | "outfit-30"
  | "outfit-31"
  | "outfit-32"
  | "outfit-33"
  | "outfit-34"
  | "outfit-35"
  | "outfit-36"
  | "outfit-37"
  | "outfit-38"
  | "outfit-39"
  | "outfit-40"
  | "outfit-41"
  | "outfit-42"
  | "outfit-43"
  | "outfit-44"
  | "outfit-45"
  | "outfit-46"
  | "outfit-47"
  | "outfit-48"
  | "outfit-49"
  | "outfit-50"
  | "outfit-51"
  | "outfit-52"
  | "outfit-53"
  | "outfit-54"
  | "outfit-55"
  | "outfit-56"
  | "outfit-57"
  | "outfit-58"
  | "outfit-59"
  | "outfit-60"
  | "outfit-61"
  | "outfit-62"
  | "outfit-63"
  | "outfit-64"
  | "outfit-65"
  | "outfit-66"
  | "outfit-67"
  | "outfit-68"
  | "outfit-69"
  | "outfit-70"
  | "outfit-71"
  | "outfit-72"
  | "outfit-73"
  | "outfit-74"
  | "outfit-75"
  | "outfit-76"
  | "outfit-77"
  | "outfit-78"
  | "outfit-79"
  | "outfit-80"
  | "outfit-81"
  | "outfit-82"
  | "outfit-83"
  | "outfit-84"
  | "outfit-85"
  | "outfit-86"
  | "outfit-87"
  | "outfit-88"
  | "outfit-89"
  | "outfit-90"
  | "outfit-91"
  | "outfit-92"
  | "outfit-93"
  | "outfit-94"
  | "outfit-95"
  | "outfit-96"
  | "outfit-97"
  | "outfit-98"
  | "outfit-99"
  | "outfit-100"
  | "outfit-101"
  | "outfit-102"
  | "outfit-103"
  | "outfit-104"
  | "outfit-105"
  | "outfit-106"
  | "outfit-107"
  | "outfit-108"
  | "outfit-109"
  | "outfit-110"
  | "outfit-111"
  | "outfit-112"
  | "outfit-113"
  | "outfit-114"
  | "outfit-115"
  | "outfit-116"
  | "outfit-117"
  | "outfit-118"
  | "outfit-119"
  | "outfit-120"
  | "outfit-121"
  | "outfit-122"
  | "outfit-123"
  | "outfit-124"
  | "outfit-125"
  | "outfit-126"
  | "outfit-127"
  | "outfit-128"
  | "outfit-129"
  | "outfit-130"
  | "outfit-131"
  | "outfit-132";
