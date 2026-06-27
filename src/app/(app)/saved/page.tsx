import { SavedClient } from "@/components/ungogo/saved-client";
import type { BookmarkKind } from "@/lib/bookmarks";

export const metadata = {
  title: "저장됨 — I-OGO",
};

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab: BookmarkKind = tab === "insight" ? "insight" : "job";

  return <SavedClient initialTab={initialTab} />;
}
