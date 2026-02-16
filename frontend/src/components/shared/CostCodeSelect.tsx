import { useState, useMemo, useRef, useEffect } from "react";
import { CostCode } from "@/types";
import { CostTypeIcon } from "./CostTypeIcon";
import { cn } from "@/lib/utils";

interface CostCodeSelectProps {
  costCodes: CostCode[];
  value?: string;
  onChange: (costCodeId: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function CostCodeSelect({
  costCodes,
  value,
  onChange,
  placeholder = "Select cost code...",
  error,
  disabled,
  className,
}: CostCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCostCode = costCodes.find((cc) => cc.id === value);

  const filteredCostCodes = useMemo(() => {
    if (!search) return costCodes;

    const searchLower = search.toLowerCase();
    return costCodes.filter(
      (cc) =>
        cc.code.toLowerCase().includes(searchLower) ||
        cc.description.toLowerCase().includes(searchLower),
    );
  }, [costCodes, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(costCode: CostCode) {
    onChange(costCode.id);
    setIsOpen(false);
    setSearch("");
  }

  function handleOpen() {
    if (!disabled) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function getCostType(type: string): "L" | "M" | "E" | "S" | "O" {
    const typeMap: Record<string, "L" | "M" | "E" | "S" | "O"> = {
      LABOR: "L",
      MATERIAL: "M",
      EQUIPMENT: "E",
      SUBCONTRACTOR: "S",
      OTHER: "O",
    };
    return typeMap[type] || "O";
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select cost code"
        aria-describedby={error ? "cost-code-error" : undefined}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-secondary-300 bg-white px-3 py-2 text-left text-sm",
          "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500",
          "disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500",
          error && "border-error focus:border-error focus:ring-error",
        )}
      >
        {selectedCostCode ? (
          <div className="flex items-center gap-2">
            <CostTypeIcon type={getCostType(selectedCostCode.type)} />
            <span className="font-mono">{selectedCostCode.code}</span>
            <span className="text-secondary-600">-</span>
            <span className="truncate">{selectedCostCode.description}</span>
          </div>
        ) : (
          <span className="text-secondary-400">{placeholder}</span>
        )}
        <svg
          className={cn(
            "ml-2 h-5 w-5 text-secondary-400 transition-transform",
            isOpen && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border border-secondary-200 bg-white shadow-lg"
          role="dialog"
          aria-label="Cost code selection"
        >
          <div className="p-2">
            <label htmlFor="cost-code-search" className="sr-only">
              Search cost codes
            </label>
            <input
              id="cost-code-search"
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or description..."
              aria-label="Search cost codes by code or description"
              className="w-full rounded border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCostCodes.length === 0 ? (
              <div
                className="px-3 py-8 text-center text-sm text-secondary-500"
                role="status"
                aria-live="polite"
              >
                No cost codes found
              </div>
            ) : (
              <ul className="py-1" role="listbox" aria-label="Cost codes">
                {filteredCostCodes.map((costCode) => (
                  <li
                    key={costCode.id}
                    role="option"
                    aria-selected={value === costCode.id}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(costCode)}
                      aria-label={`${costCode.code} - ${costCode.description}`}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary-100",
                        value === costCode.id &&
                          "bg-primary-50 text-primary-900",
                      )}
                    >
                      <CostTypeIcon type={getCostType(costCode.type)} />
                      <span className="font-mono font-medium">
                        {costCode.code}
                      </span>
                      <span className="text-secondary-600" aria-hidden="true">
                        -
                      </span>
                      <span className="flex-1 truncate">
                        {costCode.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {error && (
        <p
          id="cost-code-error"
          className="mt-1 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
