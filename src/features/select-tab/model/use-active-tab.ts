"use client";

import type { TabKey } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";

export function useActiveTab() {
  const activeTab = useChatSessionStore((state) => state.activeSession?.activeTab ?? "chat");
  const setActiveTab = useChatSessionStore((state) => state.setActiveTab);

  return {
    activeTab,
    setActiveTab: (tab: TabKey) => setActiveTab(tab)
  };
}
