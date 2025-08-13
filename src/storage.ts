import type { Customer } from "./types";
const STORAGE_KEY = "crm.byphone.v2";

export const loadCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : [];
  } catch (err) {
    console.warn("[storage] loadCustomers failed:", err);
    return [];
  }
};

export const saveCustomers = (data: Customer[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("[storage] saveCustomers failed:", err);
  }
};

export const upsertCustomer = (list: Customer[], customer: Customer): Customer[] => {
  const idx = list.findIndex((c) => c.id === customer.id);
  const next = [...list];
  if (idx >= 0) next[idx] = customer;
  else next.unshift(customer);
  saveCustomers(next);
  return next;
};

export const removeCustomerById = (list: Customer[], id: string): Customer[] => {
  const next = list.filter((c) => c.id !== id);
  saveCustomers(next);
  return next;
};
