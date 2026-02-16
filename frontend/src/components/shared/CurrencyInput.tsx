import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value?: number;
  onChange?: (value: number | null) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const formatCurrency = (num: number): string => {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    };

    const parseCurrency = (str: string): number | null => {
      const cleaned = str.replace(/[^0-9.-]/g, "");
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setDisplayValue(input);

      const parsed = parseCurrency(input);
      onChange?.(parsed);
    };

    const handleBlur = () => {
      if (displayValue) {
        const parsed = parseCurrency(displayValue);
        if (parsed !== null) {
          setDisplayValue(formatCurrency(parsed));
        }
      }
    };

    return (
      <div className="relative">
        <label htmlFor="currency-input" className="sr-only">
          Currency amount in dollars
        </label>
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          aria-hidden="true"
        >
          $
        </span>
        <Input
          id="currency-input"
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn("pl-7", className)}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label="Currency amount"
          aria-describedby="currency-format-hint"
          {...props}
        />
        <span id="currency-format-hint" className="sr-only">
          Enter amount in dollars and cents, for example 1234.56
        </span>
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
