import { forwardRef, InputHTMLAttributes, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface PercentageInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value?: number;
  onChange?: (value: number | null) => void;
  error?: string;
  min?: number;
  max?: number;
}

export const PercentageInput = forwardRef<
  HTMLInputElement,
  PercentageInputProps
>(
  (
    { value, onChange, error, min = 0, max = 100, className, ...props },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const lastValueRef = useRef<number | null | undefined>(undefined);

    // Solo actualizar cuando no está enfocado y el valor cambió externamente
    if (!isFocused && value !== lastValueRef.current) {
      lastValueRef.current = value;
      if (value !== undefined && value !== null) {
        setDisplayValue(formatForDisplay(value));
      } else {
        setDisplayValue("");
      }
    }

    function formatForDisplay(num: number): string {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(num);
    }

    function parseInput(input: string): number | null {
      const cleaned = input.replace(/[^0-9.-]/g, "");
      const parsed = parseFloat(cleaned);

      if (isNaN(parsed)) return null;

      // Clamp between min and max
      return Math.max(min, Math.min(max, parsed));
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const input = e.target.value;
      setDisplayValue(input);

      const parsed = parseInput(input);
      onChange?.(parsed);
    }

    function handleFocus() {
      setIsFocused(true);
    }

    function handleBlur() {
      setIsFocused(false);
      if (value !== null && value !== undefined) {
        setDisplayValue(formatForDisplay(value));
      } else if (!displayValue) {
        setDisplayValue("");
      }
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "block w-full rounded-md border border-secondary-300 py-2 pl-3 pr-8 text-right font-mono text-sm",
            "placeholder:text-secondary-400",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500",
            "disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500",
            error && "border-error focus:border-error focus:ring-error",
            className,
          )}
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-secondary-500">%</span>
        </div>
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  },
);

PercentageInput.displayName = "PercentageInput";
