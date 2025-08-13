// CustomersPage.tsx
import { useMemo, useState } from "react";
import type { Customer, RangeMode } from "../types";
import { loadCustomers } from "../storage";
import SmartDatePicker from "../components/SmartDatePicker";

// 👇 helper
function isoToDMY(iso: string) {
  if (!iso) return "";
  // phát hiện yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  }
  // đã là dd-mm-yyyy thì giữ nguyên
  if (/^\d{2}-\d{2}-\d{4}$/.test(iso)) return iso;
  return iso; // format khác thì trả nguyên xi
}
function normalizeCustomer(c: Customer): Customer {
  return { ...c, dob: isoToDMY(c.dob) };
}

export default function CustomersPage() {
  // 👇 chuẩn hoá khi load
  const [customers] = useState<Customer[]>(() => loadCustomers().map(normalizeCustomer));

  const [mode, setMode] = useState<RangeMode>("day");
  const [anchor, setAnchor] = useState<string>(() => todayDMY()); // dd-mm-yyyy

  const filtered = useMemo(() => {
    const list =
      mode === "all"
        ? customers
        : customers.filter((c) => {
            const d = new Date(c.createdAt);
            const base = parseDMY(anchor);
            if (mode === "day")   return isSameDay(d, base);
            if (mode === "month") return isSameMonth(d, base);
            if (mode === "year")  return isSameYear(d, base);
            return true;
          });

    return [...list].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
  }, [customers, mode, anchor]);

  return (
    <div className="space-y-4">
      {/* Bộ lọc giống OrdersPage */}
      <section className="section">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="filter-mode" className="label font-semibold">
            Lọc theo:
          </label>
          <select
            id="filter-mode"
            className="select max-w-[160px]"
            value={mode}
            onChange={(e) => setMode(e.target.value as RangeMode)}
          >
            <option value="day">Ngày</option>
            <option value="month">Tháng</option>
            <option value="year">Năm</option>
            <option value="all">Tất cả</option>
          </select>

          {mode !== "all" && (
            <SmartDatePicker
              mode={mode}
              value={anchor}       // dd-mm-yyyy
              onChange={setAnchor} // dd-mm-yyyy
              className="ml-2"
              buttonClassName="input"
            />
          )}

          <div className="ml-auto chip">
            Tổng KH: <span className="ml-1 font-semibold">{filtered.length}</span>
          </div>
        </div>
      </section>

      {/* Bảng dữ liệu */}
      <section className="section overflow-hidden p-0">
        <div className="bg-black/5 dark:bg-white/10 px-4 py-3 font-semibold">
          Danh sách khách hàng ({filtered.length})
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <Th>Ngày tạo</Th>
                <Th>Tên</Th>
                <Th>SĐT</Th>
                <Th>Ngày sinh</Th>
                <Th className="text-right">Số đơn</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/10">
                  <Td>{new Date(c.createdAt).toLocaleString()}</Td>
                  <Td>{c.name || <span className="text-gray-400">(Chưa đặt tên)</span>}</Td>
                  <Td>{c.phone}</Td>
                  {/* 👇 luôn hiển thị dd-mm-yyyy */}
                  <Td>{formatDobDMY(c.dob)}</Td>
                  <Td className="text-right">{c.purchases.length}</Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <Td colSpan={5}>
                    <div className="py-6 text-center text-gray-500">Không có dữ liệu</div>
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({ children, className = "", ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...rest} className={`px-4 py-3 ${className}`}>{children}</th>;
}
function Td({ children, className = "", ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...rest} className={`px-4 py-3 ${className}`}>{children}</td>;
}

/* ===== helpers: dd-mm-yyyy ===== */

function formatDobDMY(input: string) {
  if (!input) return "-";
  if (/^\d{2}-\d{2}-\d{4}$/.test(input)) return input;         // đã đúng dd-mm-yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return isoToDMY(input); // yyyy-mm-dd -> dd-mm-yyyy
  return input; // format khác thì hiển thị nguyên bản
}

function todayDMY() {
  const t = new Date();
  const dd = String(t.getDate()).padStart(2, "0");
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const yy = t.getFullYear();
  return `${dd}-${mm}-${yy}`;
}

function parseDMY(s: string): Date {
  const [dd, mm, yy] = s.split("-").map(Number);
  return new Date(yy, (mm || 1) - 1, dd || 1);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth();
}
function isSameYear(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear();
}
