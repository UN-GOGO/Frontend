"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={loading}
      data-icon="inline-start"
      className={className}
    >
      <LogOut />
      <span data-label className="whitespace-nowrap">
        로그아웃
      </span>
    </Button>
  );
}
