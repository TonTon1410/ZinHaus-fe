import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./theme";

import Home from "./pages/Home";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";

const ITEMS = [
  { key: "home", label: "Trang chủ" },
  { key: "customers", label: "Quản lí khách hàng" },
  { key: "orders", label: "Quản lí đơn hàng" },
];

export default function App() {
  const [tab, setTab] = useState<string>("home");

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-900 dark:text-gray-100 transition-colors">
        <div className="flex">
          <Sidebar items={ITEMS} active={tab} onSelect={setTab} />
          <main className="flex-1 min-w-0">
            <header className="sticky top-0 z-30 backdrop-blur border-b bg-white/60 dark:bg-neutral-900/60">
              <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-lg font-semibold">
                  {tab === "home" ? "Trang chủ" : tab === "customers" ? "Quản lí khách hàng" : "Quản lí đơn hàng"}
                </h1>
                <ThemeToggle />
              </div>
            </header>
            <div className="max-w-6xl mx-auto px-4 py-6">
              {tab === "home" && <Home />}
              {tab === "customers" && <CustomersPage />}
              {tab === "orders" && <OrdersPage />}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
