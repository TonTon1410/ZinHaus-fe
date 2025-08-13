export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const money = (n: number) =>
  (Number(n) || 0).toLocaleString("vi-VN") + "₫";

export const stripPhone = (s: string) => (s || "").replace(/\D/g, "");

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
