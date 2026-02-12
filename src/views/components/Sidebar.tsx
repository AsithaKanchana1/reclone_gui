import type { Remote, AppView } from "@/models/types";

type Props = {
  remotes: Remote[];
  selectedRemote: string;
  onSelectRemote: (name: string) => void;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onRefresh: () => void;
  onOpenWizard: () => void;
};

export default function Sidebar({
  remotes,
  selectedRemote,
  onSelectRemote,
  currentView,
  onChangeView,
  onRefresh,
  onOpenWizard,
}: Props) {
  return (
    <aside className="flex w-56 flex-col border-r border-white/10 bg-slate-900">
      {/* Logo / brand */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <span className="text-xl">🔄</span>
        <span className="text-lg font-bold text-white">Reclone</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <button
          className={`w-full px-4 py-2 text-left text-sm transition ${
            currentView === "dashboard" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
          }`}
          onClick={() => onChangeView("dashboard")}
        >
          🏠 Dashboard
        </button>
        <button
          className={`w-full px-4 py-2 text-left text-sm transition ${
            currentView === "about" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
          }`}
          onClick={() => onChangeView("about")}
        >
          ℹ️ About
        </button>

        <div className="mt-4 px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Remotes
            </h3>
            <button
              onClick={onRefresh}
              className="text-xs text-white/40 hover:text-white"
              title="Refresh remotes"
            >
              🔃
            </button>
          </div>
          <button
            onClick={onOpenWizard}
            className="mt-2 w-full rounded bg-brand-600/70 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-500"
          >
            ＋ Add / Edit
          </button>
          <ul className="mt-2 space-y-0.5">
            {remotes.map((r) => (
              <li key={r.name}>
                <button
                  className={`w-full rounded px-2 py-1.5 text-left text-sm transition ${
                    selectedRemote === r.name
                      ? "bg-brand-600/30 text-brand-300"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => onSelectRemote(r.name)}
                >
                  {r.name}
                </button>
              </li>
            ))}
            {!remotes.length && (
              <li className="px-2 text-xs text-white/30">No remotes configured</li>
            )}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
