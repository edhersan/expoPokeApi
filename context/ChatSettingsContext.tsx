// ──────────────────────────────────────────────────────────────
// ARCHIVO:  context/ChatSettingsContext.tsx
// FUNCIÓN:  Context React para configuración dinámica del chat
//           (timeout y proveedor de IA)
// USADO POR: app/(tabs)/chat.tsx, app/(tabs)/_layout.tsx
// ──────────────────────────────────────────────────────────────

import { createContext, useContext, useState, ReactNode } from 'react';
import { DEFAULT_CHAT_TIMEOUT_MS } from '@/constants/chat';
import { AIProvider } from '@/types';

interface ChatSettingsContextValue {
  timeoutMs: number;
  setTimeoutMs: (ms: number) => void;
  provider: AIProvider;
  setProvider: (p: AIProvider) => void;
}

const ChatSettingsContext = createContext<ChatSettingsContextValue | null>(null);

export function ChatSettingsProvider({ children }: { children: ReactNode }) {
  const [timeoutMs, setTimeoutMs] = useState(DEFAULT_CHAT_TIMEOUT_MS);
  const [provider, setProvider] = useState<AIProvider>('gemini');

  return (
    <ChatSettingsContext.Provider value={{ timeoutMs, setTimeoutMs, provider, setProvider }}>
      {children}
    </ChatSettingsContext.Provider>
  );
}

export function useChatSettings() {
  const ctx = useContext(ChatSettingsContext);
  if (!ctx) {
    throw new Error('useChatSettings debe usarse dentro de ChatSettingsProvider');
  }
  return ctx;
}