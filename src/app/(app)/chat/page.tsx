import { ChatClient } from "@/components/ungogo/chat-client";

export const metadata = {
  title: "챗봇 — Polaris",
};

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <ChatClient />
    </div>
  );
}
