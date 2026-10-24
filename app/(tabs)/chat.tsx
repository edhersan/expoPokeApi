// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/(tabs)/chat.tsx
// FUNCIÓN:  Wrapper para ChatScreen que provee ChatSettingsContext
// USADO POR: app/(tabs)/_layout.tsx
// ──────────────────────────────────────────────────────────────

import { ChatSettingsProvider } from '@/context/ChatSettingsContext';
import ChatScreen from '@/components/chat/ChatScreen';

export default function ChatScreenWrapper() {
  return (
    <ChatSettingsProvider>
      <ChatScreen />
    </ChatSettingsProvider>
  );
}