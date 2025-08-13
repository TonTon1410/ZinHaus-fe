import { useTheme } from "../theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      aria-label="Chuyển giao diện sáng/tối"
      className="rounded-lg border px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
      onClick={toggle}
      title={theme === "dark" ? "Đang Dark" : "Đang Light"}
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
