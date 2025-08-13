type Item = { key: string; label: string; icon?: React.ReactNode };

export default function Sidebar({
  items,
  active,
  onSelect,
}: {
  items: Item[];
  active: string;
  onSelect: (k: string) => void;
}) {
  return (
    <aside
      className="w-64 shrink-0 h-screen sticky top-0 border-r border-gray-200 bg-white
                 text-gray-900 transition-colors
                 dark:border-white/10 dark:bg-neutral-900 dark:text-gray-100"
    >
      <div className="px-4 py-4 text-lg font-bold">Customer Admin</div>

      <nav className="px-2 space-y-1">
        {items.map((it) => {
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors
                          hover:bg-black/5 dark:hover:bg-white/10
                          ${isActive ? "bg-black/10 dark:bg-white/10 font-semibold" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {it.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
