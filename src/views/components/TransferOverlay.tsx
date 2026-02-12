import type { TransferProgress } from "@/models/types";

const OP_COLORS: Record<string, string> = {
  sync: "bg-emerald-400",
  copy: "bg-sky-400",
  move: "bg-amber-400",
  check: "bg-violet-400",
};

const STATUS_COLORS: Record<string, string> = {
  running: "text-white",
  complete: "text-emerald-400",
  error: "text-red-400",
  cancelled: "text-yellow-400",
};

type Props = {
  transfers: TransferProgress[];
  onCancel: (id: string) => void;
  onDismiss: (id: string) => void;
};

export default function TransferOverlay({ transfers, onCancel, onDismiss }: Props) {
  if (!transfers.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-900 text-white shadow-2xl max-h-60 overflow-y-auto">
      {transfers.map((t) => (
        <div key={t.id} className="mx-auto flex max-w-5xl items-center gap-4 border-b border-white/5 px-6 py-2.5">
          {/* Operation badge */}
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${OP_COLORS[t.op] || "bg-slate-500"} text-slate-900`}>
            {t.op}
          </span>

          {/* Labels */}
          <div className="min-w-[140px] text-xs leading-snug">
            <div className="text-slate-200 truncate max-w-[200px]">{t.source}</div>
            <div className="text-slate-500 truncate max-w-[200px]">→ {t.destination}</div>
          </div>

          {/* Progress bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className={`uppercase tracking-wider ${STATUS_COLORS[t.status] || "text-white"}`}>
                {t.status === "running"
                  ? `${t.op === "sync" ? "Syncing" : t.op === "copy" ? "Copying" : t.op === "move" ? "Moving" : "Checking"}`
                  : t.status}
              </span>
              <span className="font-mono">{t.percentage.toFixed(1)}%</span>
            </div>
            <div className="mt-0.5 h-1.5 rounded-full bg-slate-700">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  t.status === "complete" ? "bg-emerald-400" :
                  t.status === "error" ? "bg-red-400" :
                  t.status === "cancelled" ? "bg-yellow-400" :
                  OP_COLORS[t.op] || "bg-emerald-400"
                }`}
                style={{ width: `${Math.min(t.percentage, 100)}%` }}
              />
            </div>
            {t.status === "running" && (
              <div className="mt-0.5 flex gap-4 text-[10px] text-slate-500">
                <span>Speed: <span className="text-white/70">{t.speed || "—"}</span></span>
                <span>ETA: <span className="text-white/70">{t.eta || "—"}</span></span>
              </div>
            )}
          </div>

          {/* Actions */}
          {t.status === "running" ? (
            <button
              onClick={() => onCancel(t.id)}
              className="rounded border border-white/20 px-2.5 py-1 text-[10px] font-semibold text-white/70 transition hover:border-red-400 hover:text-red-400"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => onDismiss(t.id)}
              className="rounded border border-white/10 px-2.5 py-1 text-[10px] text-white/40 hover:text-white"
            >
              Dismiss
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
