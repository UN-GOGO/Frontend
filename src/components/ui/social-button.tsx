import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const socialButtonVariants = cva(
  "flex w-full items-center justify-center gap-2.5 rounded-[11px] p-3 text-sm font-bold transition-colors outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        outline:
          "border-border bg-card text-foreground border hover:bg-background hover:border-[#C9D3E0]",
        kakao:
          "bg-[#FEE500] text-[#181600] transition-[filter] hover:brightness-[0.97]",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

function SocialButton({
  className,
  variant = "outline",
  icon,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof socialButtonVariants> & {
    icon?: React.ReactNode;
  }) {
  return (
    <ButtonPrimitive
      type="button"
      data-slot="social-button"
      className={cn(socialButtonVariants({ variant, className }))}
      {...props}
    >
      {icon != null && (
        <span className="flex size-[18px] shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="whitespace-nowrap">{children}</span>
    </ButtonPrimitive>
  );
}

export { SocialButton, socialButtonVariants };
