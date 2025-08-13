import { useEffect, useMemo, useRef, useState } from "react";
import type { Customer } from "../types";
import { stripPhone } from "../utils/date";

type Props = {
  value: string;
  onChange: (v: string) => void;
  customers: Customer[];
  onSelectCustomer: (c: Customer) => void;
  onConfirmPhone: (phone: string) => void;
};

export default function PhoneAutocomplete({
  value,
  onChange,
  customers,
  onSelectCustomer,
  onConfirmPhone,
}: Props) {
  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const clean = stripPhone(value);
  const suggestions = useMemo(() => {
    if (!clean) return [] as Customer[];
    return customers
      .filter((c) => stripPhone(c.phone).startsWith(clean))
      .sort((a, b) => stripPhone(a.phone).localeCompare(stripPhone(b.phone)))
      .slice(0, 8);
  }, [customers, clean]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHoverIndex((i) => Math.min(i + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHoverIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      if (open && hoverIndex >= 0 && suggestions[hoverIndex]) {
        onSelectCustomer(suggestions[hoverIndex]);
        setOpen(false);
      } else {
        onConfirmPhone(clean);
        setOpen(false);
      }
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        id="phone-input"
        aria-label="Số điện thoại khách hàng"
        className="input input-lg"
        placeholder="Số điện thoại"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHoverIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        inputMode="tel"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white dark:bg-neutral-900 shadow-card max-h-64 overflow-auto">
          {suggestions.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              className={`block w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/10 ${
                idx === hoverIndex ? "bg-gray-50 dark:bg-white/10" : ""
              }`}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectCustomer(c);
                setOpen(false);
              }}
            >
              <div className="font-medium">{c.phone}</div>
              <div className="text-xs text-gray-500">
                {c.name || "(Chưa đặt tên)"}
                {c.dob ? ` • DOB: ${c.dob}` : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
