import { PostHog } from "posthog-node";

const noopPostHog = {
  capture() {},
  captureException() {},
  identify() {},
  shutdown() { return Promise.resolve(); },
  flush() { return Promise.resolve(); },
} as unknown as PostHog;

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return noopPostHog;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}
