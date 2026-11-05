import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function goBack(router: AppRouterInstance, fallback: string) {
  if (
    window.history.length > 1 &&
    document.referrer.startsWith(window.location.origin)
  ) {
    router.back();
  } else {
    router.push(fallback);
  }
}
