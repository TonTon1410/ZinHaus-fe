import { useEffect, useMemo, useState } from "react";
import type { Customer, Purchase } from "../types";
import { loadCustomers, saveCustomers, upsertCustomer } from "../storage";
import { stripPhone, uid, money } from "../utils/date";
import PhoneAutocomplete from "../components/PhoneAutocomplete";
import CustomerForm from "../components/CustomerForm";
import PurchaseForm from "../components/PurchaseForm";
import Invoice from "../components/Invoice";

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>(() => loadCustomers());
  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  const [phone, setPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [invoiceData, setInvoiceData] = useState<{ c: Customer; ps: Purchase[] } | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function onSelectCustomer(c: Customer) {
    setSelectedCustomer(c);
    setPhone(c.phone);
  }

  function onConfirmPhone(cleanPhone: string) {
    if (!cleanPhone) return;
    const exist = customers.find((c) => stripPhone(c.phone) === cleanPhone);
    if (exist) return setSelectedCustomer(exist);
    const newC: Customer = {
      id: uid(),
      name: "",
      phone: cleanPhone,
      dob: "",
      createdAt: new Date().toISOString(),
      purchases: [],
    };
    setCustomers((prev) => upsertCustomer(prev, newC));
    setSelectedCustomer(newC);
    setEditingCustomer(newC);
  }

  function saveCustomer(c: Customer) {
    setCustomers((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    setSelectedCustomer(c);
    setEditingCustomer(null);
  }

  function addPurchaseForSelected() {
    if (!selectedCustomer) return alert("Nhập/chọn SĐT trước");
    const p: Purchase = {
      id: uid(),
      productName: "",
      date: new Date().toISOString(),
      qty: 1,
      unitPrice: 0,
      warrantyMonths: 0,
      note: "",
    };
    setEditingPurchase(p);
  }

  function savePurchase(p: Purchase) {
    if (!selectedCustomer) return;

    const exists = selectedCustomer.purchases.some((x) => x.id === p.id);
    const nextPurchases = exists
      ? selectedCustomer.purchases.map((x) => (x.id === p.id ? p : x))
      : [p, ...selectedCustomer.purchases];

    const updated = { ...selectedCustomer, purchases: nextPurchases };
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCustomer(updated);
    setEditingPurchase(null);
  }

  const lastOrders = useMemo(
    () => (selectedCustomer ? selectedCustomer.purchases.slice(0, 5) : []),
    [selectedCustomer]
  );

  function editPurchase(p: Purchase) {
    setEditingPurchase(p);
  }

  function deletePurchase(purchaseId: string) {
    if (!selectedCustomer) return;
    if (!confirm("Xóa đơn hàng này?")) return;

    const updated = {
      ...selectedCustomer,
      purchases: selectedCustomer.purchases.filter((x) => x.id !== purchaseId),
    };
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCustomer(updated);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border p-4 bg-white/70 dark:bg-neutral-900/60">
        <h2 className="font-semibold mb-3">Số điện thoại</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <PhoneAutocomplete
            value={phone}
            onChange={setPhone}
            customers={customers}
            onSelectCustomer={onSelectCustomer}
            onConfirmPhone={(v) => onConfirmPhone(stripPhone(v))}
          />
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl bg-black text-white px-4 py-2 hover:bg-gray-800"
              onClick={() => onConfirmPhone(stripPhone(phone))}
            >
              Chọn / Tạo khách
            </button>
            {selectedCustomer && (
              <button
                className="rounded-xl border px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/10"
                onClick={() => setEditingCustomer(selectedCustomer)}
              >
                Sửa thông tin
              </button>
            )}
            <button
              className="rounded-xl border px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/10"
              onClick={addPurchaseForSelected}
            >
              + Giao dịch
            </button>
          </div>
        </div>

        {selectedCustomer && (
          <div className="mt-4 text-sm">
            <div className="text-gray-500">Khách hàng đã chọn</div>
            <div className="font-medium">
              {selectedCustomer.name || "(Chưa đặt tên)"} • {selectedCustomer.phone}
              {selectedCustomer.dob ? ` • DOB: ${selectedCustomer.dob}` : ""}
            </div>

            <div className="mt-3 text-gray-600 dark:text-gray-300">
              <div className="text-xs uppercase tracking-wide mb-1">Các đơn hàng gần đây</div>

              {/* Danh sách đơn hàng (UL chỉ chứa LI) */}
              <ul className="space-y-1">
                {lastOrders.length === 0 && (
                  <li className="text-gray-500">Chưa có đơn hàng</li>
                )}

                {lastOrders.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between border rounded-lg px-3 py-2 gap-3"
                  >
                    <label className="flex items-center gap-2">
                      {/* checkbox chọn nhiều để in */}
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!checked[p.id]}
                        onChange={(e) =>
                          setChecked((prev) => ({
                            ...prev,
                            [p.id]: e.target.checked,
                          }))
                        }
                      />
                      <div className="truncate">
                        <span className="font-medium">{p.productName}</span>
                        {" • "}
                        {p.qty || 1} × {p.unitPrice || 0} →{" "}
                        <b>{money((p.qty || 1) * (p.unitPrice || 0))}</b>
                        <span className="text-gray-500">
                          {" "}
                          • {new Date(p.date).toLocaleString()}
                        </span>
                      </div>
                    </label>

                    <div className="flex items-center gap-2">
                      <button className="btn" onClick={() => editPurchase(p)}>
                        Sửa
                      </button>
                      <button
                        className="btn"
                        onClick={() => setInvoiceData({ c: selectedCustomer!, ps: [p] })}
                      >
                        In
                      </button>
                      <button className="btn" onClick={() => deletePurchase(p.id)}>
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Đưa nút in hàng loạt RA NGOÀI <ul> để đúng chuẩn aXe */}
              {selectedCustomer && selectedCustomer.purchases.length > 0 && (
                <div className="pt-2">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      const list = selectedCustomer.purchases.filter((x) => checked[x.id]);
                      if (list.length === 0) return alert("Chưa chọn đơn nào để in");
                      setInvoiceData({ c: selectedCustomer, ps: list });
                    }}
                  >
                    In các mục đã chọn
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {editingCustomer && (
        <CustomerForm
          initial={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={saveCustomer}
        />
      )}

      {editingPurchase && (
        <PurchaseForm
          initial={editingPurchase}
          onClose={() => setEditingPurchase(null)}
          onSave={savePurchase}
        />
      )}

      {invoiceData && (
        <Invoice
          customer={invoiceData.c}
          purchases={invoiceData.ps}
          onClose={() => setInvoiceData(null)}
        />
      )}
    </div>
  );
}
