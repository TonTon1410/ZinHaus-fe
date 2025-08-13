import { useEffect, useRef } from "react";
import type { Customer, Purchase } from "../types";
import { money } from "../utils/date";

export default function Invoice({
  customer,
  purchases, // đổi: nhận mảng đơn hàng
  onClose,
}: {
  customer: Customer;
  purchases: Purchase[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // vẫn tự gọi hộp thoại in khi mở hóa đơn
  useEffect(() => {
    const t = setTimeout(() => window.print(), 120);
    return () => clearTimeout(t);
  }, []);

  const grandTotal = purchases.reduce(
    (sum, p) => sum + (Number(p.unitPrice) || 0) * (Number(p.qty || 1) || 1),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 print:bg-white print:p-0 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={ref}
        className="bg-white dark:bg-neutral-900 text-black dark:text-white w-[900px] max-w-full rounded-2xl shadow-xl print:shadow-none p-8 print:p-6 print:w-full print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">HÓA ĐƠN / PHIẾU BẢO HÀNH</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              In lúc: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-white/10"
              onClick={() => window.print()}
            >
              In
            </button>
            <button
              className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-white/10"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>

        <hr className="my-4 border-gray-200 dark:border-white/20" />

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <div className="font-semibold mb-2">Thông tin khách hàng</div>
            <div>Tên: {customer.name || "(Chưa đặt tên)"}</div>
            <div>SĐT: {customer.phone}</div>
            {customer.dob && <div>Ngày sinh: {customer.dob}</div>}
          </div>
          <div>
            <div className="font-semibold mb-2">Thông tin mua hàng</div>
            <div>Số dòng hàng: {purchases.length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-white/20">
            <thead className="bg-gray-50 dark:bg-white/10">
              <tr>
                <Th>Thời gian</Th>
                <Th>Sản phẩm</Th>
                <Th className="text-right">SL</Th>
                <Th className="text-right">Đơn giá</Th>
                <Th className="text-right">Thành tiền</Th>
                <Th>BH</Th>
                <Th>Ghi chú</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {purchases.map((p) => {
                const total =
                  (Number(p.unitPrice) || 0) * (Number(p.qty || 1) || 1);
                const warrantyUntil =
                  p.warrantyMonths && p.date
                    ? new Date(
                        new Date(p.date).setMonth(
                          new Date(p.date).getMonth() + (p.warrantyMonths || 0)
                        )
                      )
                    : null;
                return (
                  <tr key={p.id}>
                    <Td>{new Date(p.date).toLocaleString()}</Td>
                    <Td>{p.productName}</Td>
                    <Td className="text-right">{p.qty || 1}</Td>
                    <Td className="text-right">{money(p.unitPrice || 0)}</Td>
                    <Td className="text-right font-semibold">{money(total)}</Td>
                    <Td className="whitespace-nowrap">
                      {p.warrantyMonths
                        ? `${p.warrantyMonths} tháng${
                            warrantyUntil
                              ? ` (đến ${warrantyUntil.toLocaleDateString()})`
                              : ""
                          }`
                        : "-"}
                    </Td>
                    <Td className="max-w-[280px] truncate" title={p.note}>
                      {p.note}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50/60 dark:bg-white/10">
              <tr>
                <Td colSpan={4} className="text-right font-semibold">
                  Tổng cộng
                </Td>
                <Td className="text-right font-bold">{money(grandTotal)}</Td>
                <Td />
                <Td />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 text-xs text-gray-600 dark:text-gray-300">
          * Vui lòng giữ phiếu để được bảo hành theo quy định cửa hàng.
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...rest}
      className={`px-3 py-2 text-left border-b border-gray-200 dark:border-white/20 ${className}`}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
  colSpan,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...rest}
      colSpan={colSpan}
      className={`px-3 py-2 border-t border-gray-200 dark:border-white/20 ${className}`}
    >
      {children}
    </td>
  );
}
