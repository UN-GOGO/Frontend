import { createClient } from "@/lib/supabase/client";

export type OAuthProvider = "google" | "kakao" | "linkedin";

const SUPABASE_PROVIDER = {
  google: "google",
  kakao: "kakao",
  linkedin: "linkedin_oidc",
} as const;

export async function signInWithProvider(provider: OAuthProvider, next = "/") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: SUPABASE_PROVIDER[provider],
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  return error;
}
