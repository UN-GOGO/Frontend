export function TermRow({
  checked,
  onChange,
  label,
  required = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-muted-foreground flex cursor-pointer items-center gap-2.5 text-[13px]">
        <input
          type="checkbox"
          className="accent-point size-[17px]"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          <span
            className={
              required
                ? "text-point-hover font-bold"
                : "text-muted-foreground/70 font-bold"
            }
          >
            {required ? "(필수) " : "(선택) "}
          </span>
          {label}
        </span>
      </label>
      <button
        type="button"
        className="text-muted-foreground/70 hover:text-point-hover text-xs whitespace-nowrap"
      >
        보기 &gt;
      </button>
    </div>
  );
}
