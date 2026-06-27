import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// 앱이 실제로 사용하는 user_metadata 키만 유지한다.
const KEEP_META_KEYS = new Set(["name", "signup_completed"]);

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function trimAuthMetadata(supabase: SupabaseServerClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  // 표시 이름이 name에 없으면 full_name에서 가져와 보존한다.
  if (meta.name == null && typeof meta.full_name === "string") {
    patch.name = meta.full_name;
  }

  let hasExtra = false;
  for (const key of Object.keys(meta)) {
    if (!KEEP_META_KEYS.has(key)) {
      patch[key] = null; // null로 설정하면 해당 키가 제거된다.
      hasExtra = true;
    }
  }

  if (hasExtra || patch.name != null) {
    await supabase.auth.updateUser({ data: patch });
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";

  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await trimAuthMetadata(supabase);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
