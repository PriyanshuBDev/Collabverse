import "server-only";

import { requireUser } from "./requireUser";
import type { User } from "@supabase/supabase-js";

type RouteContext<TParams extends Record<string, string>> = {
  params: TParams;
};

export function withAuth<
  TParams extends Record<string, string> = Record<string, never>,
>(
  handler: (
    user: User,
    req: Request,
    context: RouteContext<TParams>
  ) => Promise<Response>
) {
  return async (
    req: Request,
    context: RouteContext<TParams>
  ): Promise<Response> => {
    try {
      const user = await requireUser();
      const resolvedContext = {
        params: await context.params,
      };
      return handler(user, req, resolvedContext);
    } catch {
      return new Response("Unauthorized", { status: 401 });
    }
  };
}
