"use client";

import dynamic from "next/dynamic";
import { useAiEnabled } from "@/components/AiSettingsProvider";

const ChatPanel = dynamic(
  () => import("@/components/ChatPanel").then((m) => m.ChatPanel),
  { ssr: false },
);

export function ChatPanelWrapper() {
  const aiEnabled = useAiEnabled();
  if (!aiEnabled) return null;
  return <ChatPanel />;
}
