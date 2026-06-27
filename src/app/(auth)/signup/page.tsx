"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

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
import { sendSignupOtp, verifySignupOtp } from "@/lib/supabase/otp";
import {
  otpSchema,
  signupSchema,
  type SignupValues,
} from "@/lib/validations/auth";
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

  const email = useWatch({ control, name: "email" });
  const [otpStatus, setOtpStatus] = useState<"idle" | "sent" | "verified">(
    "idle",
  );
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const emailValid = z.email().safeParse(email?.trim() ?? "").success;

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

  const handleSendOtp = async () => {
    if (!emailValid || sending) return;
    setSending(true);
    setOtpError(null);
    const { error } = await sendSignupOtp(email.trim());
    setSending(false);
    if (error) {
      setOtpError("인증번호 전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setOtpStatus("sent");
  };

  const handleVerifyOtp = async () => {
    if (verifying) return;
    if (!otpSchema.safeParse(otp).success) {
      setOtpError("8자리 숫자를 입력해 주세요.");
      return;
    }
    setVerifying(true);
    setOtpError(null);
    const { isExistingAccount, error } = await verifySignupOtp(
      email.trim(),
      otp,
    );
    setVerifying(false);
    if (error) {
      setOtpError("인증번호가 올바르지 않거나 만료됐어요. 다시 받아 주세요.");
      return;
    }
    if (isExistingAccount) {
      setOtpStatus("idle");
      setOtp("");
      setError("email", { message: "이미 가입된 이메일이에요." });
      return;
    }
    setOtpStatus("verified");
  };

  const onSubmit = async (values: SignupValues) => {
    if (otpStatus !== "verified") {
      setError("root", { message: "이메일 인증을 먼저 완료해 주세요." });
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({
      password: values.pw,
      data: {
        name: values.name.trim(),
        marketing_opt_in: values.marketing,
      },
    });

    if (error || !data.user) {
      setError("root", {
        message: "가입에 실패했어요. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    const { error: profileError } = await supabase
      .from("users")
      .update({ onboarded: true })
      .eq("id", data.user.id);

    if (profileError) {
      setError("root", {
        message: "가입에 실패했어요. 잠시 후 다시 시도해 주세요.",
      });
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

            {/* 이메일 + 인증번호 받기 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="이메일"
                  autoComplete="email"
                  readOnly={otpStatus === "verified"}
                  aria-invalid={!!errors.email}
                  className="flex-1"
                  {...register("email")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={!emailValid || sending || otpStatus === "verified"}
                  className="h-auto shrink-0 px-3 text-xs font-extrabold"
                >
                  {otpStatus === "verified"
                    ? "인증 완료"
                    : otpStatus === "sent"
                      ? "재전송"
                      : "인증번호 받기"}
                </Button>
              </div>
              {errors.email && (
                <span className="text-destructive text-xs" role="alert">
                  {errors.email.message}
                </span>
              )}

              {/* OTP 입력칸 (발송 후 등장) */}
              {otpStatus !== "idle" && (
                <div className="mt-1 flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="인증번호 8자리"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))
                      }
                      readOnly={otpStatus === "verified"}
                      aria-invalid={!!otpError}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyOtp}
                      disabled={
                        verifying ||
                        otp.length !== 8 ||
                        otpStatus === "verified"
                      }
                      className="h-auto shrink-0 px-3 text-xs font-extrabold"
                    >
                      {otpStatus === "verified" ? "✓ 인증됨" : "확인"}
                    </Button>
                  </div>
                  {otpError && (
                    <span className="text-destructive text-xs" role="alert">
                      {otpError}
                    </span>
                  )}
                  {otpStatus === "verified" && (
                    <span className="text-xs text-green-600" role="status">
                      이메일 인증이 완료됐어요.
                    </span>
                  )}
                </div>
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
              disabled={!requiredOk || otpStatus !== "verified" || isSubmitting}
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
