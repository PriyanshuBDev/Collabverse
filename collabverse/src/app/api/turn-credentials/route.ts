import { TurnixCredentialsResponse } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { apiErrorCustom } from "@/lib/functions/error/apiError";

export const GET = withAuth(async () => {
  try {
    const token = process.env.TURNIX_API_TOKEN;

    if (!token) {
      return apiErrorCustom("TURN service is not configured");
    }

    const response = await fetch("https://turnix.io/api/v1/credentials/ice", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl: 3600 }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Turnix credential request failed:", response.status);
      return apiErrorCustom("Could not obtain TURN credentials");
    }

    const data = (await response.json()) as TurnixCredentialsResponse;

    return Response.json(
      {
        iceServers: data.iceServers,
        expiresAt: data.expiresAt,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("Turnix request failed:", error);
    return apiErrorCustom("Something went wrong");
  }
});
