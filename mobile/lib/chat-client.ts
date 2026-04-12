import { supabase } from "./supabase";
import { env } from "./env";

export interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
}

/**
 * Send a chat message and get a streamed response.
 * Falls back to full response if streaming isn't supported.
 */
export async function sendChatMessage(
  messages: readonly ChatMessage[],
  onChunk: (text: string) => void,
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${env.apiUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Chat request failed: ${res.status}`);
  }

  // Try to read as stream
  if (res.body && typeof res.body.getReader === "function") {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(fullText);
    }

    return fullText;
  }

  // Fallback: read as text
  const text = await res.text();
  onChunk(text);
  return text;
}
