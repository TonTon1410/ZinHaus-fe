import { useState } from "react";
import type { Customer } from "../types";

type Props = {
  initial: Customer;
  onClose: () => void;
  onSave: (c: Customer) => void;
};

export default function CustomerForm({ initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<Customer>({ ...initial });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl card p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-xl font-semibold mb-4">Thông tin khách hàng</h3>

        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="field">
              <span className="label">Tên</span>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                required
              />
            </label>

            <label className="field">
              <span className="label">SĐT</span>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                inputMode="tel"
                placeholder="090..."
                required
              />
            </label>

            <label className="field md:max-w-xs">
              <span className="label">Ngày sinh</span>
              <input
                type="date"
                className="input"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                required
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn">
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
