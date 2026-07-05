import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="bg-background flex h-dvh flex-col overflow-hidden">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        <Sidebar isLoggedIn={!!user} />
        <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
