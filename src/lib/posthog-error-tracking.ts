import posthog from "posthog-js";

type ExceptionContext = Record<string, unknown>;

function serializeError(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function normalizeError(error: unknown): { error: Error; properties?: ExceptionContext } {
  if (error instanceof Error) {
    return { error };
  }

  return {
    error: new Error("Non-Error exception captured"),
    properties: {
      original_error: serializeError(error),
    },
  };
}

export function capturePostHogException(error: unknown, context?: ExceptionContext) {
  if (typeof window === "undefined" || !posthog.__loaded) {
    return;
  }

  const normalized = normalizeError(error);

  posthog.captureException(normalized.error, {
    ...normalized.properties,
    ...context,
  });
}
