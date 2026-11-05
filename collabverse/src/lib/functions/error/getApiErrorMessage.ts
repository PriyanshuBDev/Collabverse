import { AxiosError } from "axios";
export type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};
export function getApiErrorMessage(
  err: AxiosError<ApiError>,
  customMessage?: string,
) {
  return (
    err.response?.data?.message ??
    Object.values(err.response?.data?.errors ?? {})[0]?.[0] ??
    customMessage ??
    "Something went wrong"
  );
}
