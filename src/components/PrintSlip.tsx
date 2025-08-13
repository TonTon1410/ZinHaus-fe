import { useEffect, useRef } from "react";
import type { Customer, Purchase } from "../types";

export default function PrintSlip({ customer, purchase, onClose }: { customer: Customer; purchase: Purchase; onClose: () => void; }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setTimeout(() => window.print(), 120); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:bg-white print:p-0" onClick={onClose}>
      <div ref={ref} className="bg-white w-[720px] max-w-full rounded-xl shadow-xl p-8 print:shadow-none print:w-full print:rounded-none" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">PHIẾU THÔNG TIN / IN CHO BẢO HÀNH</h2>
            <p className="text-sm text-gray-600">In lúc: {new Date().toLocaleString()}</p>
          </div>
          <button className="hidden print:hidden md:block text-sm border px-3 py-1 rounded" onClick={() => window.print()}>In</button>
        </div>
        <hr className="my-4" />
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="font-semibold">Khách hàng</div>
            <div>Tên: {customer.name}</div>
            <div>SĐT: {customer.phone}</div>
            <div>Ngày sinh: {customer.dob}</div>
          </div>
          <div>
            <div className="font-semibold">Sản phẩm</div>
            <div>Tên: {purchase.productName}</div>
            <div>Ngày mua: {new Date(purchase.date).toLocaleString()}</div>
            {purchase.note && <div>Ghi chú: {purchase.note}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}