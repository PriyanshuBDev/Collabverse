import { ZodErrorResponse } from "@/app/interfaces";
import axios, { AxiosError } from "axios";

export function isZodError<T extends ZodErrorResponse>(
  e: unknown,
): e is AxiosError<T> {
  return axios.isAxiosError<T>(e) && !!e.response?.data?.errors;
}
