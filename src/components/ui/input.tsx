import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        "border-border text-foreground placeholder:text-muted-foreground focus:border-point aria-invalid:border-destructive aria-invalid:bg-destructive/5 w-full rounded-[11px] border-[1.5px] px-3.5 py-3 text-sm outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
