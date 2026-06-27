import { ChatClient } from "@/components/chat/chat-client";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "챗봇 — I-OGO",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-full flex-col">
      <ChatClient isLoggedIn={!!user} />
    </div>
  );
}
