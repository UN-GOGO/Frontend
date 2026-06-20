import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "올바른 이메일 형식이 아니에요." }),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "이름을 입력해 주세요."),
    email: z.email({ error: "올바른 이메일 형식이 아니에요." }),
    pw: z.string().min(8, "비밀번호는 8자 이상이어야 해요."),
    pw2: z.string().min(1, "비밀번호를 한 번 더 입력해 주세요."),
    tos: z.boolean(),
    privacy: z.boolean(),
    marketing: z.boolean(),
  })
  .refine((d) => d.pw === d.pw2, {
    path: ["pw2"],
    error: "비밀번호가 일치하지 않아요.",
  })
  .refine((d) => d.tos, {
    path: ["tos"],
    error: "필수 약관에 동의해 주세요.",
  })
  .refine((d) => d.privacy, {
    path: ["privacy"],
    error: "필수 약관에 동의해 주세요.",
  });

export type SignupValues = z.infer<typeof signupSchema>;
