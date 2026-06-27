"use client";

import { useEffect, useState } from "react";

import { ConnBadge, type ConnState } from "@/components/common/conn-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProfile, updateProfile, type Profile } from "@/lib/api/iogo";
import { getUserId } from "@/lib/api/user";

export function ProfileClient() {
  const [state, setState] = useState<ConnState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [education, setEducation] = useState("");
  const [major, setMajor] = useState("");
  const [saved, setSaved] = useState<Profile | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      const id = await getUserId();
      setUserId(id);
      try {
        const p = await getProfile(id, { signal: ctrl.signal });
        setEducation(p.education ?? "");
        setMajor(p.major ?? "");
        setSaved(p);
        setState("ok");
      } catch (e: unknown) {
        if (ctrl.signal.aborted) return;
        // 404(프로필 없음)도 "연결됨"으로 본다 — 백엔드는 응답했으므로.
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("404")) {
          setState("ok");
        } else {
          setError(msg);
          setState("error");
        }
      }
    })();
    return () => ctrl.abort();
  }, []);

  const save = async () => {
    try {
      const p = await updateProfile(userId, { education, major });
      setSaved(p);
      setState("ok");
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setState("error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-6 py-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-foreground text-xl font-bold">내 프로필</h1>
        <ConnBadge state={state} error={error} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-muted-foreground text-xs font-semibold">
          학력 (education)
          <Input
            className="mt-1"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="예: 학사 재학"
          />
        </label>
        <label className="text-muted-foreground text-xs font-semibold">
          전공 (major)
          <Input
            className="mt-1"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            placeholder="예: 국제학"
          />
        </label>
        <Button onClick={save} className="mt-1 self-start">
          저장 (PUT /profile)
        </Button>
      </div>

      <div className="text-muted-foreground mt-4 text-[11px]">
        user_id: <code>{userId || "…"}</code>
      </div>

      {saved && (
        <pre className="border-border bg-muted/40 mt-4 overflow-x-auto rounded-xl border p-3 text-xs">
          {JSON.stringify(saved, null, 2)}
        </pre>
      )}
    </div>
  );
}
