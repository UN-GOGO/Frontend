// 공고(Opportunity) 카드/상세에서 공유하는 표시 헬퍼.

/** 기관명에서 카드 로고용 약어를 만든다. */
export function orgAbbrev(org: string): string {
  const cleaned = org.trim();
  if (!cleaned) return "?";
  const words = cleaned.split(/\s+/);
  if (words.length > 1) {
    return words
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();
  }
  return cleaned.slice(0, 4).toUpperCase();
}

/** score(0~1)를 적합도 뱃지 퍼센트·스타일로 변환한다. */
export function fitBadge(score: number) {
  const pct = Math.round(score * 100);
  const cls =
    pct >= 85
      ? "bg-point text-point-foreground"
      : pct >= 70
        ? "bg-point-soft text-point-hover"
        : "bg-secondary text-muted-foreground";
  return { pct, cls };
}

/** 마감일에서 D-day 칩 정보를 만든다. (없거나 형식 오류면 null) */
export function ddayChip(deadline?: string | null) {
  if (!deadline) return null;
  const due = new Date(deadline);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  const d0 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const d1 = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
  const days = Math.round((d1 - d0) / 86400000);

  if (days < 0) {
    return { label: "마감", cls: "bg-secondary text-muted-foreground" };
  }
  const label = days === 0 ? "D-DAY" : `D-${days}`;
  const cls =
    days <= 7
      ? "bg-destructive/10 text-destructive"
      : "bg-secondary text-muted-foreground";
  return { label, cls };
}
