import { AxiosError } from "axios";

export function AuthParamExistsNormal(e: AxiosError) {
  switch (e.status) {
    case 400: {
      return "Invalid input";
    }
    case 403: {
      return "You are not authorized";
    }
    case 404: {
      return "Not found";
    }
    default: {
      return "Something went wrong";
    }
  }
}
