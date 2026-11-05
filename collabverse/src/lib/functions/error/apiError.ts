import { ZodError } from "zod";

export function apiError(message: string, status: number) {
  return Response.json({ message }, { status });
}
type message =
  | "You are not authorised"
  | "You are not authenticated"
  | "You cannot change your own role"
  | "You cannot remove yourself"
  | "Invalid parameters"
  | "Invalid data"
  | "Something went wrong"
  | "Due date must be in the future"
  | "Invalid Invitation"
  | "Invitation expired"
  | "Invitation already accepted"
  | "Invitation revoked"
  | "Already a member"
  | "Join request alredy exist"
  | "User not a member"
  | "Task not found"
  | "Project not found"
  | "Workspace not found"
  | "Activtiy not found"
  | "Notification not found"
  | "Invitation not found"
  | "User not found"
  | "Conversation not found"
  | "Group not found"
  | "Message not found"
  | "You cannot create a conversation with yourself"
  | "No actaual data provided"
  | "You can not call in a group"
  | "Call not found"
  | "Participation limit reached"
  | "FlowSpace not found"
  | "Comment not found"
  | "Membership not found"
  | "Transfer your workspace ownership before leaving"
  | "Transfer your project ownership before leaving";
const ERROR_STATUS_MAP: Record<message, number> = {
  "Invalid data": 400,
  "Invalid parameters": 400,
  "Something went wrong": 500,
  "You are not authenticated": 401,
  "You are not authorised": 403,
  "You cannot change your own role": 403,
  "Due date must be in the future": 400,
  "Invalid Invitation": 400,
  "Invitation expired": 400,
  "Invitation revoked": 400,
  "Invitation already accepted": 400,
  "Already a member": 400,
  "User not a member": 400,
  "Join request alredy exist": 400,
  "Task not found": 404,
  "Activtiy not found": 404,
  "Project not found": 404,
  "Notification not found": 404,
  "Workspace not found": 404,
  "Invitation not found": 404,
  "User not found": 404,
  "Conversation not found": 404,
  "Group not found": 404,
  "You cannot remove yourself": 403,
  "You cannot create a conversation with yourself": 403,
  "Message not found": 404,
  "No actaual data provided": 400,
  "You can not call in a group": 403,
  "Call not found": 404,
  "Participation limit reached": 403,
  "FlowSpace not found": 404,
  "Comment not found": 404,
  "Membership not found": 404,
  "Transfer your workspace ownership before leaving": 403,
  "Transfer your project ownership before leaving": 403,
};

export function apiErrorCustom(message: message) {
  return apiError(message, ERROR_STATUS_MAP[message]);
}

export function zodApiError(e: unknown) {
  if (e instanceof ZodError) {
    return Response.json({ errors: e.flatten().fieldErrors }, { status: 400 });
  }
  return apiErrorCustom("Something went wrong");
}
