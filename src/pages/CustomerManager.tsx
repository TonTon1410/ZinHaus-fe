import { useState } from "react";
import type { Customer } from "../types";
import SmartDatePicker from "../components/SmartDatePicker"; // ✅ import

type Props = {
  initial: Customer;
  onClose: () => void;
  onSave: (c: Customer) => void;
};

export default function CustomerForm({ initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<Customer>({ ...initial });
  const [error, setError] = useState<string>("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // đảm bảo dob có giá trị dd-mm-yyyy
    if (!form.dob) {
      setError("Vui lòng chọn ngày sinh");
      return;
    }
    setError("");
    onSave(form);
  }

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
        <h3 className="text-xl font-semibold mb-4">Thông tin khách hàng</h3>

        <form className="space-y-4" onSubmit={submit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium">Tên</span>
              <input
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white text-gray-900
                           placeholder-gray-400 px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           dark:border-white/15 dark:bg-neutral-800 dark:text-gray-100 dark:placeholder-gray-400"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium">SĐT</span>
              <input
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white text-gray-900
                           placeholder-gray-400 px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           dark:border-white/15 dark:bg-neutral-800 dark:text-gray-100 dark:placeholder-gray-400"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                inputMode="tel"
                required
              />
            </label>

            <div className="md:col-span-2 md:max-w-xs">
              <span className="block text-sm font-medium">Ngày sinh</span>
              <div className="mt-1">
                {/* ✅ dùng SmartDatePicker, format dd-mm-yyyy */}
                <SmartDatePicker
                  mode="day"
                  value={form.dob || ""}
                  onChange={(next) => setForm({ ...form, dob: next })} // next là dd-mm-yyyy
                  buttonClassName="w-full text-left rounded-xl px-3 py-2 border
                                   border-gray-300 bg-white text-gray-900
                                   focus:outline-none hover:bg-gray-50
                                   dark:border-white/15 dark:bg-neutral-800 dark:text-gray-100
                                   dark:hover:bg-white/10"
                />
              </div>
              {error && (
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</div>
              )}
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
