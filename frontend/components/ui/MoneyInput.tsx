// components/ui/MoneyInput.tsx
//
// Text input for prices that shows thousands separators while typing
// ("1,250,000.50") but hands the plain number string ("1250000.50") to
// onValueChange — so saving code doesn't change.
import React, { useEffect, useState } from "react";
import { formatMoneyInput } from "@/lib/format";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string | number | null | undefined;
  onValueChange: (raw: string) => void;
  /** Optional symbol shown inside the input, e.g. "₦" or "$". */
  prefix?: string;
};

const toRaw = (display: string) => display.replace(/,/g, "");

export default function MoneyInput({ value, onValueChange, prefix, className = "", style, ...rest }: Props) {
  const raw = value === null || value === undefined ? "" : String(value);
  const [display, setDisplay] = useState(() => formatMoneyInput(raw));

  // Keep in sync when the value changes from outside (e.g. form reset / load).
  useEffect(() => {
    if (toRaw(display) !== raw && parseFloat(toRaw(display) || "0") !== parseFloat(raw || "0")) {
      setDisplay(formatMoneyInput(raw));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">{prefix}</span>
      )}
      <input
        {...rest}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={display}
        onChange={(e) => {
          const next = formatMoneyInput(e.target.value);
          setDisplay(next);
          onValueChange(toRaw(next));
        }}
        className={className}
        style={prefix ? { paddingLeft: "1.75rem", ...style } : style}
      />
    </div>
  );
}
