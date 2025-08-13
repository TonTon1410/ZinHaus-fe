import { useMemo, useState } from "react";
import type { Customer, RangeMode } from "../types";
import { loadCustomers } from "../storage";
import { money } from "../utils/date"; // giữ nguyên
import SmartDatePicker from "../components/SmartDatePicker"; // DatePicker trả dd-mm-yyyy

export default function OrdersPage() {
  const [customers] = useState<Customer[]>(() => loadCustomers());
  const flat = useMemo(
    () => customers.flatMap((c) => c.purchases.map((p) => ({ c, p }))),
    [customers]
  );

  const [mode, setMode] = useState<RangeMode>("day");
  const [anchor, setAnchor] = useState<string>(() => todayDMY()); // dd-mm-yyyy

  const filtered = useMemo(() => {
    const list =
      mode === "all"
        ? flat
        : flat.filter(({ p }) => {
            const d = new Date(p.date);          // ngày giao dịch thực tế (Date chuẩn)
            const base = parseDMY(anchor);       // mốc lọc (dd-mm-yyyy)
            if (mode === "day")   return isSameDay(d, base);
            if (mode === "month") return isSameMonth(d, base);
            if (mode === "year")  return isSameYear(d, base);
            return true;
          });

    return list.sort((a, b) => +new Date(b.p.date) - +new Date(a.p.date));
  }, [flat, mode, anchor]);

  const totalAmount = useMemo(
    () =>
      filtered.reduce(
        (sum, { p }) => sum + (Number(p.unitPrice || 0) * Number(p.qty || 1)),
        0
      ),
    [filtered]
  );

  return (
    <div className="space-y-4">
      {/* Bộ lọc */}
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
              value={anchor}              // dd-mm-yyyy
              onChange={setAnchor}        // trả dd-mm-yyyy
              className="ml-2"
              buttonClassName="input"
            />
          )}

          <div className="ml-auto chip">
            Tổng: <span className="ml-1 font-semibold">{money(totalAmount)}</span>
          </div>
        </div>
      </section>

      {/* Bảng đơn hàng */}
      <section className="section overflow-hidden p-0">
        <div className="bg-black/5 dark:bg-white/10 px-4 py-3 font-semibold">
          Danh sách đơn hàng ({filtered.length})
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <Th>Thời gian</Th>
                <Th>SĐT</Th>
                <Th>Khách hàng</Th>
                <Th>Sản phẩm</Th>
                <Th className="text-right">SL</Th>
                <Th className="text-right">Đơn giá</Th>
                <Th className="text-right">Thành tiền</Th>
                <Th>Ghi chú</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {filtered.map(({ c, p }) => (
                <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <Td>{new Date(p.date).toLocaleString()}</Td>
                  <Td>{c.phone}</Td>
                  <Td>{c.name || <span className="text-gray-400">(Chưa đặt tên)</span>}</Td>
                  <Td>{p.productName}</Td>
                  <Td className="text-right">{p.qty || 1}</Td>
                  <Td className="text-right">{money(p.unitPrice || 0)}</Td>
                  <Td className="text-right font-semibold">
                    {money((p.qty || 1) * (p.unitPrice || 0))}
                  </Td>
                  <Td className="max-w-[320px] truncate" title={p.note}>
                    {p.note}
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <Td colSpan={8}>
                    <div className="py-8 text-center text-gray-500">Không có dữ liệu</div>
                  </Td>
                </tr>
              )}
            </tbody>

            {filtered.length > 0 && (
              <tfoot className="bg-black/5 dark:bg-white/10">
                <tr>
                  <Td colSpan={6} className="text-right font-semibold">Tổng cộng</Td>
                  <Td className="text-right font-bold">{money(totalAmount)}</Td>
                  <Td />
                </tr>
              </tfoot>
            )}
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
  return <td {...rest} className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

/* ===== helpers: dd-mm-yyyy ===== */

function todayDMY() {
  const t = new Date();
  const dd = String(t.getDate()).padStart(2, "0");
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const yy = t.getFullYear();
  return `${dd}-${mm}-${yy}`;
}

function parseDMY(s: string): Date {
  // s: dd-mm-yyyy
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
