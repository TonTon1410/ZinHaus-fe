// src/components/SmartDatePicker.tsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type RangeMode = "day" | "month" | "year";

interface SmartDatePickerProps {
  mode: RangeMode;
  /** day: dd-mm-yyyy | month: 01-mm-yyyy | year: 01-01-yyyy */
  value: string;
  onChange: (next: string) => void;
  className?: string;
  buttonClassName?: string;
  usePortal?: boolean; // default true
}

export default function SmartDatePicker({
  mode,
  value,
  onChange,
  className = "",
  buttonClassName = "",
  usePortal = true,
}: SmartDatePickerProps) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const popRef  = useRef<HTMLDivElement>(null);

  // Anchor -> Date (view)
  const parseAnchor = React.useCallback((): Date => {
    const dt = parseDMY(value);
    if (Number.isNaN(+dt)) return new Date();
    if (mode === "month") return new Date(dt.getFullYear(), dt.getMonth(), 1);
    if (mode === "year")  return new Date(dt.getFullYear(), 0, 1);
    return dt;
  }, [value, mode]);

  const [view, setView] = useState<Date>(parseAnchor());
  useEffect(() => { setView(parseAnchor()); }, [parseAnchor]);

  // Click outside (tính cả button & popover do portal)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const y = view.getFullYear();
  const m = view.getMonth();

  const labelId = useMemo(() => `sdp-label-${uid()}`, []);
  const panelId = useMemo(() => `sdp-panel-${uid()}`, []);

  const label = useMemo(() => {
    if (mode === "day")   return view.toLocaleString(undefined, { month: "long", year: "numeric" });
    if (mode === "month") return String(y);
    const start = Math.floor(y / 12) * 12;
    return `${start}–${start + 11}`;
  }, [mode, view, y]);

  function prev() {
    if (mode === "day")   setView(new Date(y, m - 1, 1));
    else if (mode === "month") setView(new Date(y - 1, m, 1));
    else setView(new Date(y - 12, m, 1));
  }
  function next() {
    if (mode === "day")   setView(new Date(y, m + 1, 1));
    else if (mode === "month") setView(new Date(y + 1, m, 1));
    else setView(new Date(y + 12, m, 1));
  }

  // ===== Quick presets =====
  function presetToday() {
    const t = new Date();
    if (mode === "day") onChange(fmtDMY(t));
    else if (mode === "month") onChange(`01-${pad2(t.getMonth() + 1)}-${t.getFullYear()}`);
    else onChange(`01-01-${t.getFullYear()}`);
    setView(t); setOpen(false);
  }
  function presetThisMonth() {
    const t = new Date();
    onChange(`01-${pad2(t.getMonth() + 1)}-${t.getFullYear()}`);
    setView(new Date(t.getFullYear(), t.getMonth(), 1)); setOpen(false);
  }
  function presetThisYear() {
    const t = new Date();
    onChange(`01-01-${t.getFullYear()}`);
    setView(new Date(t.getFullYear(), 0, 1)); setOpen(false);
  }
  function presetClear() { onChange(""); setOpen(false); }

  // ===== Grids =====
  const dayGrid = useMemo(() => {
    if (mode !== "day") return [];
    const first = new Date(y, m, 1);
    const startWeekday = (first.getDay() + 6) % 7; // Mon-start
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const d = new Date(y, m, i - startWeekday + 1);
      cells.push({ date: d, inMonth: d.getMonth() === m });
    }
    return cells;
  }, [mode, y, m]);

  const months = useMemo(() => (mode === "month" ? Array.from({ length: 12 }, (_, i) => i) : []), [mode]);

  const years = useMemo(() => {
    if (mode !== "year") return [];
    const start = Math.floor(y / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => start + i);
  }, [mode, y]);

  // ===== Button label =====
  const buttonLabel = useMemo(() => {
    if (!value) return "Chọn...";
    if (mode === "day") return value;
    if (mode === "month") {
      const dt = parseDMY(value);
      return Number.isNaN(+dt) ? value : dt.toLocaleString(undefined, { month: "long", year: "numeric" });
    }
    const yr = parseDMY(value).getFullYear();
    return Number.isNaN(yr) ? value : String(yr);
  }, [mode, value]);

  // ===== Selection handlers =====
  function selectDay(d: Date)      { onChange(fmtDMY(d)); setOpen(false); }
  function selectMonth(mi: number) { onChange(`01-${pad2(mi + 1)}-${y}`); setOpen(false); }
  function selectYear(yy: number)  { onChange(`01-01-${yy}`); setOpen(false); }

  // ====== Fixed placement (no inline styles) ======
  useFixedPlacement({ open, btnRef, panelId });

  // ===== Popover =====
  const popover = (
    <div
      id={panelId}
      ref={popRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      className="sdp-portal mt-2 min-w-[300px] rounded-2xl border bg-white shadow-xl dark:border-white/10 dark:bg-neutral-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b dark:border-white/10">
        <button className="rounded-lg px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={prev} aria-label="Previous">‹</button>
        <div id={labelId} className="font-semibold select-none">{label}</div>
        <button className="rounded-lg px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={next} aria-label="Next">›</button>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2 px-3 pt-3">
        <button className="rounded-lg border px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10" onClick={presetToday}>Hôm nay</button>
        <button className="rounded-lg border px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10" onClick={presetThisMonth}>Tháng này</button>
        <button className="rounded-lg border px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10" onClick={presetThisYear}>Năm nay</button>
        <button className="ml-auto rounded-lg border px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10" onClick={presetClear}>Xóa</button>
      </div>

      {/* Body */}
      <div className="p-3">
        {mode === "day" && (
          <>
            <div className="grid grid-cols-7 text-xs text-gray-500 dark:text-gray-400 mb-1">
              {["T2","T3","T4","T5","T6","T7","CN"].map(w => <div key={w} className="text-center py-1 select-none">{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dayGrid.map(({ date, inMonth }, idx) => {
                const isToday = isSameDate(date, new Date());
                const isSelected = isSameDate(date, parseDMY(value));
                return (
                  <button
                    key={idx}
                    className={[
                      "h-9 rounded-lg text-sm transition-colors",
                      inMonth ? "" : "text-gray-400", // bỏ text-current để không lẫn màu
                      "hover:bg-black/5 dark:hover:bg-white/10",
                      // ✅ Light: bg-black + !text-white; Dark: bg-white + !text-black
                      isSelected ? "bg-black !text-white hover:!text-white dark:bg-white dark:!text-black dark:hover:!text-black" : "",
                      isToday && !isSelected ? "ring-1 ring-black/20 dark:ring-white/20" : "",
                    ].join(" ")}
                    onClick={() => selectDay(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === "month" && (
          <div className="grid grid-cols-3 gap-2">
            {months.map(mi => {
              const temp = new Date(y, mi, 1);
              const lab = temp.toLocaleString(undefined, { month: "short" });
              const cur = parseDMY(value);
              const isSelected = cur.getFullYear() === y && cur.getMonth() === mi;
              return (
                <button
                  key={mi}
                  className={[
                    "h-10 rounded-xl text-sm",
                    "hover:bg-black/5 dark:hover:bg-white/10",
                    // ✅ Light/Dark tương ứng như trên
                    isSelected ? "bg-black !text-white dark:bg-white dark:!text-black" : "",
                  ].join(" ")}
                  onClick={() => selectMonth(mi)}
                >
                  {lab}
                </button>
              );
            })}
          </div>
        )}

        {mode === "year" && (
          <div className="grid grid-cols-3 gap-2">
            {years.map(yy => {
              const selYear = parseDMY(value).getFullYear();
              const isSelected = selYear === yy;
              return (
                <button
                  key={yy}
                  className={[
                    "h-10 rounded-xl text-sm",
                    "hover:bg-black/5 dark:hover:bg-white/10",
                    // ✅ Light/Dark tương ứng như trên
                    isSelected ? "bg-black !text-white dark:bg-white dark:!text-black" : "",
                  ].join(" ")}
                  onClick={() => selectYear(yy)}
                >
                  {yy}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative inline-block ${className}`} ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        className={["inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/10", buttonClassName].join(" ")}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-expanded={open}
      >
        {buttonLabel}
        <svg className="ml-2 h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.25 7.5l4.5 4.5 4.5-4.5" /></svg>
      </button>

      {!usePortal && open && (<div className="absolute z-50">{popover}</div>)}
      {usePortal && open && createPortal(popover, document.body)}
    </div>
  );
}

/* ===================== utils (dd-mm-yyyy) ===================== */

function pad2(n: number) { return String(n).padStart(2, "0"); }
function fmtDMY(d: Date) { return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`; }
function parseDMY(s: string): Date {
  const [ddStr, mmStr, yyStr] = (s || "").split("-");
  const dd = Number(ddStr), mm = Number(mmStr), yy = Number(yyStr);
  if (!yy || !mm || !dd) return new Date(NaN);
  return new Date(yy, mm - 1, dd);
}
function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function uid() { return Math.random().toString(36).slice(2, 10); }

/* ====== CSS placement bằng <style> động (no inline styles) ====== */
function useFixedPlacement({
  open,
  btnRef,
  panelId,
}: {
  open: boolean;
  btnRef: React.RefObject<HTMLButtonElement | null>;
  panelId: string;
}) {
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;

    const styleId = `${panelId}-style`;
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const update = () => {
      const r = btnRef.current!.getBoundingClientRect();
      const margin = 8;
      const estW = 320, estH = 320;

      let top  = r.bottom + margin;
      let left = r.left;

      if (top + estH > window.innerHeight) top = Math.max(8, r.top - estH - margin);
      if (left + estW > window.innerWidth) left = Math.max(8, window.innerWidth - estW - 8);

      styleEl!.textContent = `#${panelId}{position:fixed;z-index:9999;min-width:300px;top:${top}px;left:${left}px;}`;
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      if (styleEl) styleEl.remove();
    };
  }, [open, btnRef, panelId]);
}
