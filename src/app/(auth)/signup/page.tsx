"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialButton } from "@/components/ui/social-button";
import {
  GoogleIcon,
  KakaoIcon,
  LinkedInIcon,
} from "@/components/ui/social-icons";
import { createClient } from "@/lib/supabase/client";
import { signInWithProvider, type OAuthProvider } from "@/lib/supabase/oauth";
import { signupSchema, type SignupValues } from "@/lib/validations/auth";
import { TermRow } from "@/components/auth/term-row";

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      pw: "",
      pw2: "",
      tos: false,
      privacy: false,
      marketing: false,
    },
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // 약관 동의 (항목별 + 전체동의)
  const tos = useWatch({ control, name: "tos" });
  const privacy = useWatch({ control, name: "privacy" });
  const marketing = useWatch({ control, name: "marketing" });
  const agreeAll = tos && privacy && marketing;
  const requiredOk = tos && privacy;

  const toggleAll = (checked: boolean) => {
    setValue("tos", checked, { shouldValidate: true });
    setValue("privacy", checked, { shouldValidate: true });
    setValue("marketing", checked);
  };

  const onSocial = async (provider: OAuthProvider) => {
    const error = await signInWithProvider(provider, "/onboarding");
    if (error) {
      setError("root", {
        message: "소셜 가입에 실패했어요. 잠시 후 다시 시도해 주세요.",
      });
    }
  };

  const onSubmit = async (values: SignupValues) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.pw,
      options: {
        data: {
          name: values.name.trim(),
          marketing_opt_in: values.marketing,
        },
      },
    });

    if (error) {
      const message = /already|registered|exists/i.test(error.message)
        ? "이미 가입된 이메일이에요."
        : "가입에 실패했어요. 잠시 후 다시 시도해 주세요.";
      setError("email", { message });
      return;
    }

    router.push("/onboarding");
  };

  return (
    <div className="bg-background flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1 items-center justify-center px-5 pt-1.5 pb-14">
        <div className="w-full max-w-98">
          {/* 로고 + 헤드라인 */}
          <div className="mb-6.5 flex flex-col items-center gap-3.5">
            <div className="bg-primary text-point flex size-12.5 items-center justify-center rounded-[15px] text-[26px]">
              ✦
            </div>
            <div className="text-center">
              <h1 className="text-foreground text-[22px] font-extrabold tracking-[-0.4px]">
                계정 만들기
              </h1>
              <p className="text-muted-foreground mt-1.5 text-[13px]">
                가입하면 적합도·저장·맞춤 조언이 켜집니다.
              </p>
            </div>
          </div>

          {/* 회원가입 카드 */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6 shadow-[0_12px_32px_rgba(45,63,102,0.06)]"
          >
            {/* 소셜 가입 */}
            <SocialButton
              onClick={() => onSocial("linkedin")}
              icon={<LinkedInIcon />}
            >
              LinkedIn으로 계속하기
            </SocialButton>
            <SocialButton
              onClick={() => onSocial("google")}
              icon={<GoogleIcon />}
            >
              Google로 계속하기
            </SocialButton>
            <SocialButton
              variant="kakao"
              onClick={() => onSocial("kakao")}
              icon={<KakaoIcon />}
            >
              카카오로 계속하기
            </SocialButton>
            {errors.root && (
              <span className="text-destructive text-xs" role="alert">
                {errors.root.message}
              </span>
            )}

            {/* 구분선 */}
            <div className="my-1.5 flex items-center gap-2.5">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground/80 text-[11px] font-semibold">
                또는 이메일로
              </span>
              <div className="bg-border h-px flex-1" />
            </div>

            {/* 이름 */}
            <div className="flex flex-col gap-1.5">
              <Input
                type="text"
                placeholder="이름"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <span className="text-destructive text-xs" role="alert">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* 이메일 */}
            <div className="flex flex-col gap-1.5">
              <Input
                type="email"
                placeholder="이메일"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <span className="text-destructive text-xs" role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="비밀번호"
                  autoComplete="new-password"
                  aria-invalid={!!errors.pw}
                  className="pr-11"
                  {...register("pw")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 표시"}
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.pw && (
                <span className="text-destructive text-xs" role="alert">
                  {errors.pw.message}
                </span>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <Input
                  type={showPw2 ? "text" : "password"}
                  placeholder="비밀번호 확인"
                  autoComplete="new-password"
                  aria-invalid={!!errors.pw2}
                  className="pr-11"
                  {...register("pw2")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((s) => !s)}
                  aria-label={showPw2 ? "비밀번호 숨기기" : "비밀번호 표시"}
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPw2 ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.pw2 && (
                <span className="text-destructive text-xs" role="alert">
                  {errors.pw2.message}
                </span>
              )}
            </div>

            {/* 약관 동의 */}
            <div className="border-border mt-1 flex flex-col gap-2 border-t border-dashed pt-3">
              <label className="text-foreground flex cursor-pointer items-center gap-2.5 text-sm font-extrabold">
                <input
                  type="checkbox"
                  className="accent-point size-4.5"
                  checked={agreeAll}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
                전체 동의
              </label>
              <div className="bg-border h-px" />

              <TermRow
                checked={tos}
                onChange={(v) => setValue("tos", v, { shouldValidate: true })}
                required
                label="이용약관 동의"
              />
              <TermRow
                checked={privacy}
                onChange={(v) =>
                  setValue("privacy", v, { shouldValidate: true })
                }
                required
                label="개인정보 수집·이용 동의"
              />
              <TermRow
                checked={marketing}
                onChange={(v) => setValue("marketing", v)}
                label="마케팅·알림 수신 동의"
              />
            </div>

            {/* 가입 CTA */}
            <Button
              type="submit"
              disabled={!requiredOk || isSubmitting}
              className="mt-1.5 h-auto w-full gap-2 rounded-[11px] p-3 font-extrabold hover:bg-[#243152] disabled:cursor-not-allowed disabled:bg-[#AEB6C7] disabled:opacity-100"
            >
              {isSubmitting && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isSubmitting ? "가입 중…" : "가입하기"}
            </Button>
          </form>

          {/* 로그인 전환 */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            <p className="text-muted-foreground/80 text-[13px]">
              이미 계정이 있으세요?
            </p>
            <Link
              href="/login"
              className="text-point-hover text-[13px] font-extrabold"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
