import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface HoursInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value?: number;
  onChange?: (value: number | null) => void;
  max?: number;
}

const HoursInput = React.forwardRef<HTMLInputElement, HoursInputProps>(
  ({ className, value, onChange, max = 24, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        setDisplayValue(formatHours(value));
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const formatHours = (num: number): string => {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(num);
    };

    const parseHours = (str: string): number | null => {
      const cleaned = str.replace(/[^0-9.]/g, "");
      const parsed = parseFloat(cleaned);

      if (isNaN(parsed)) return null;
      if (parsed < 0) return 0;
      if (parsed > max) return max;

      return parsed;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setDisplayValue(input);

      const parsed = parseHours(input);
      onChange?.(parsed);
    };

    const handleBlur = () => {
      if (displayValue) {
        const parsed = parseHours(displayValue);
        if (parsed !== null) {
          setDisplayValue(formatHours(parsed));
        }
      }
    };

    return (
      <div className="relative">
        <label htmlFor="hours-input" className="sr-only">
          Hours worked
        </label>
        <Input
          id="hours-input"
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn("pr-12", className)}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label="Hours worked"
          aria-describedby="hours-format-hint"
          {...props}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm"
          aria-hidden="true"
        >
          hrs
        </span>
        <span id="hours-format-hint" className="sr-only">
          Enter hours as a decimal number, maximum {max} hours
        </span>
      </div>
    );
  },
);

HoursInput.displayName = "HoursInput";

export { HoursInput };
