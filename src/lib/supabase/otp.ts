import type { AuthError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

export async function sendSignupOtp(
  email: string,
): Promise<{ error: AuthError | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  return { error };
}

export async function verifySignupOtp(
  email: string,
  token: string,
): Promise<{ isExistingAccount: boolean; error: AuthError | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: "email",
  });

  if (error) {
    return { isExistingAccount: false, error };
  }

  const meta = data.user?.user_metadata ?? {};
  const isExistingAccount = Boolean(meta.signup_completed || meta.name);

  if (isExistingAccount) {
    await supabase.auth.signOut();
  }

  return { isExistingAccount, error: null };
}
