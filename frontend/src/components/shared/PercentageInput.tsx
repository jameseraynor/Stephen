import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PercentageInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value?: number;
  onChange?: (value: number | null) => void;
}

const PercentageInput = React.forwardRef<
  HTMLInputElement,
  PercentageInputProps
>(({ className, value, onChange, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState("");

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatPercentage(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const formatPercentage = (num: number): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num);
  };

  const parsePercentage = (str: string): number | null => {
    const cleaned = str.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);

    if (isNaN(parsed)) return null;
    if (parsed < 0) return 0;
    if (parsed > 100) return 100;

    return parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    const parsed = parsePercentage(input);
    onChange?.(parsed);
  };

  const handleBlur = () => {
    if (displayValue) {
      const parsed = parsePercentage(displayValue);
      if (parsed !== null) {
        setDisplayValue(formatPercentage(parsed));
      }
    }
  };

  return (
    <div className="relative">
      <label htmlFor="percentage-input" className="sr-only">
        Percentage value
      </label>
      <Input
        id="percentage-input"
        ref={ref}
        type="text"
        inputMode="decimal"
        className={cn("pr-8", className)}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label="Percentage value"
        aria-describedby="percentage-format-hint"
        {...props}
      />
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
        aria-hidden="true"
      >
        %
      </span>
      <span id="percentage-format-hint" className="sr-only">
        Enter percentage between 0 and 100
      </span>
    </div>
  );
});

PercentageInput.displayName = "PercentageInput";

export { PercentageInput };
