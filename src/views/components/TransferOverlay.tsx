import type { TransferProgress } from "@/models/types";

type Props = {
  transfer: TransferProgress | null;
  onCancel?: () => void;
};

export default function TransferOverlay({ transfer, onCancel }: Props) {
  if (!transfer) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-900 text-white shadow-2xl">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3">
        {/* Labels */}
        <div className="min-w-[160px] text-sm leading-snug">
          <div className="font-semibold text-slate-100 truncate">{transfer.source}</div>
          <div className="text-slate-400 truncate">→ {transfer.destination}</div>
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider">
              {transfer.op === "sync" ? "Syncing" : "Copying"}
            </span>
            <span className="font-mono">{transfer.percentage.toFixed(1)}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-700">
            <div
              className="h-2 rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(transfer.percentage, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex gap-6 text-xs text-slate-400">
            <span>Speed: <span className="text-white">{transfer.speed || "—"}</span></span>
            <span>ETA: <span className="text-white">{transfer.eta || "—"}</span></span>
          </div>
        </div>

        {/* Cancel */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
