import { useState } from "react";
import type { Purchase } from "../types";
import { money } from "../utils/date";

export default function PurchaseForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Purchase;
  onClose: () => void;
  onSave: (p: Purchase) => void;
}) {
  const [form, setForm] = useState<Purchase>({ ...initial });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      qty: Math.max(1, Number(form.qty || 1)),
      unitPrice: Math.max(0, Number(form.unitPrice || 0)),
    });
  }

  const total =
    (Number(form.unitPrice) || 0) * (Number(form.qty || 1) || 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur
                   dark:border-white/10 dark:bg-neutral-900/80 shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4">Thêm/Cập nhật giao dịch</h3>

        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-product" className="block text-sm font-medium">
                Sản phẩm
              </label>
              <input
                id="pf-product"
                className="input"
                value={form.productName}
                onChange={(e) =>
                  setForm({ ...form, productName: e.target.value })
                }
              />
            </div>

            <div>
              <label htmlFor="pf-date" className="block text-sm font-medium">
                Ngày mua
              </label>
              <input
                id="pf-date"
                type="datetime-local"
                className="input"
                value={form.date.slice(0, 16)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="pf-qty" className="block text-sm font-medium">
                Số lượng
              </label>
              <input
                id="pf-qty"
                type="number"
                min={1}
                className="input"
                value={form.qty || 1}
                onChange={(e) =>
                  setForm({ ...form, qty: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label htmlFor="pf-price" className="block text-sm font-medium">
                Đơn giá (VND)
              </label>
              <input
                id="pf-price"
                type="number"
                min={0}
                className="input"
                value={form.unitPrice || 0}
                onChange={(e) =>
                  setForm({ ...form, unitPrice: Number(e.target.value) })
                }
              />
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Thành tiền: <b>{money(total)}</b>
              </div>
            </div>

            <div>
              <label
                htmlFor="pf-warranty"
                className="block text-sm font-medium"
              >
                Bảo hành (tháng)
              </label>
              <input
                id="pf-warranty"
                type="number"
                min={0}
                className="input"
                value={form.warrantyMonths || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    warrantyMonths: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="pf-note" className="block text-sm font-medium">
                Ghi chú
              </label>
              <input
                id="pf-note"
                className="input"
                value={form.note || ""}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm
                         hover:bg-gray-100 active:bg-gray-200
                         dark:border-white/15 dark:hover:bg-white/10 dark:active:bg-white/15"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                         hover:bg-indigo-500 active:bg-indigo-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
