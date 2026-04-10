import { PostHog } from "posthog-node";
import { env } from "@/lib/env";

const noopPostHog = {
  capture() {},
  captureException() {},
  identify() {},
  shutdown() { return Promise.resolve(); },
  flush() { return Promise.resolve(); },
} as unknown as PostHog;

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  const { NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST } = env();
  if (!NEXT_PUBLIC_POSTHOG_KEY) {
    return noopPostHog;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(NEXT_PUBLIC_POSTHOG_KEY, {
      host: NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}
