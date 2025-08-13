export type Purchase = {
  id: string;
  productName: string;
  date: string;          // ISO
  qty?: number;
  unitPrice?: number;
  warrantyMonths?: number;
  note?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  dob: string;           // YYYY-MM-DD
  createdAt: string;     // ISO
  purchases: Purchase[];
};

export type RangeMode = "day" | "month" | "year" | "all";
