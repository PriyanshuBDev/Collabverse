import { AxiosError } from "axios";

export function AuthParamNormal(e: AxiosError) {
  switch (e.status) {
    case 400: {
      return "Invalid input";
    }
    case 403: {
      return "You are not authorized";
    }
    default: {
      return "Something went wrong";
    }
  }
}
