import { MypageClient } from "@/components/ungogo/mypage-client";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "마이페이지 — I-OGO",
};

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name = ((user?.user_metadata?.name as string | undefined) ?? "").trim();
  const email = user?.email ?? "";

  return <MypageClient name={name} email={email} />;
}
