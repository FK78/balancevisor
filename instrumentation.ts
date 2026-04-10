import type { Instrumentation } from "next";
import { getPostHogClient } from "@/lib/posthog-server";

function extractDistinctId(cookieHeader?: string | string[]) {
  const cookieString = Array.isArray(cookieHeader) ? cookieHeader.join("; ") : cookieHeader;
  if (!cookieString) {
    return undefined;
  }

  const postHogCookieMatch = cookieString.match(/ph_phc_.*?_posthog=([^;]+)/);
  if (!postHogCookieMatch?.[1]) {
    return undefined;
  }

  try {
    const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
    const postHogData = JSON.parse(decodedCookie) as { distinct_id?: string };
    return postHogData.distinct_id;
  } catch {
    return undefined;
  }
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  try {
    const posthog = getPostHogClient();
    const distinctId = extractDistinctId(request.headers.cookie);
    const errorDigest =
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof error.digest === "string"
        ? error.digest
        : undefined;

    posthog.captureException(error, distinctId, {
      source: "next_on_request_error",
      error_digest: errorDigest,
      path: request.path,
      method: request.method,
      router_kind: context.routerKind,
      route_path: context.routePath,
      route_type: context.routeType,
      render_source: context.renderSource,
      revalidate_reason: context.revalidateReason,
    });

    await posthog.flush();
  } catch {
    // Silently ignore PostHog errors to prevent cascading failures
  }
};
