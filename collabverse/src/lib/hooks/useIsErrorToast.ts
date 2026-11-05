import { AxiosError } from "axios";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  ApiError,
  getApiErrorMessage,
} from "../functions/error/getApiErrorMessage";

export function useIsErrorToast(
  isError: boolean,
  msg: string,
  e: Error | null,
) {
  const error = e as AxiosError<ApiError>;
  useEffect(() => {
    if (isError) {
      toast.error(getApiErrorMessage(error, msg));
    }
  }, [isError, error, msg]);
}
