import { useState, useEffect, useCallback } from "react";
import type { Remote, RemoteEntry, SyncOptions, TransferOp } from "@/models/types";
import { DEFAULT_SYNC_OPTIONS } from "@/models/types";
import { fetchFiles, startTransfer } from "@/services/rcloneApi";

// ──── Helpers ───────────────────────────────────────────────────────

const OP_LABELS: Record<TransferOp, { label: string; desc: string; icon: string }> = {
  copy: { label: "Keep both", desc: "Copy only — never delete at destination", icon: "📥" },
  sync: { label: "Make identical", desc: "Sync & delete extras at destination", icon: "🔄" },
  move: { label: "Move", desc: "Copy then delete from source", icon: "📦" },
  check: { label: "Check", desc: "Validate contents match", icon: "✅" },
};

type Props = {
  remotes: Remote[];
  initialSource?: string;
  initialSourcePath?: string;
  initialDest?: string;
  onClose: () => void;
  onStarted: () => void;
};

// ──── Mini file picker ──────────────────────────────────────────────

function MiniPicker({
  remote,
  path,
  onRemoteChange,
  onPathChange,
  remotes,
  label,
}: {
  remote: string;
  path: string;
  onRemoteChange: (r: string) => void;
  onPathChange: (p: string) => void;
  remotes: Remote[];
  label: string;
}) {
  const [entries, setEntries] = useState<RemoteEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!remote) return;
    setLoading(true);
    fetchFiles(remote, path)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [remote, path]);

  useEffect(() => { load(); }, [load]);

  const goUp = () => {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    onPathChange(parts.join("/"));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</label>
      <select
        value={remote}
        onChange={(e) => { onRemoteChange(e.target.value); onPathChange(""); }}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
      >
        <option value="">Select remote…</option>
        {remotes.map((r) => (
          <option key={r.name} value={r.name}>{r.name}</option>
        ))}
      </select>

      {remote && (
        <>
          <div className="flex items-center gap-1 rounded bg-white/5 px-2 py-1 font-mono text-xs text-white/60">
            <span className="truncate flex-1">{remote}:{path || "/"}</span>
            <button onClick={goUp} disabled={!path} className="text-white/40 hover:text-white disabled:opacity-30">⬆</button>
            <button onClick={load} className="text-white/40 hover:text-white">🔄</button>
          </div>
          <div className="max-h-48 overflow-y-auto rounded border border-white/10 bg-slate-900">
            {loading ? (
              <p className="p-3 text-center text-xs text-white/40">Loading…</p>
            ) : entries.filter((e) => e.IsDir).length === 0 ? (
              <p className="p-3 text-center text-xs text-white/40">No subfolders</p>
            ) : (
              entries.filter((e) => e.IsDir).map((e) => (
                <button
                  key={e.Name}
                  onClick={() => onPathChange(path ? `${path}/${e.Name}` : e.Name)}
                  className="flex w-full items-center gap-2 border-b border-white/5 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
                >
                  <span>📁</span>
                  <span className="truncate">{e.Name}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ──── Main Dialog ───────────────────────────────────────────────────

export default function SyncDialog({ remotes, initialSource, initialSourcePath, initialDest, onClose, onStarted }: Props) {
  const [opts, setOpts] = useState<SyncOptions>({
    ...DEFAULT_SYNC_OPTIONS,
    op: "copy",
    sourceRemote: initialSource || "",
    sourcePath: initialSourcePath || "",
    destRemote: initialDest || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const set = <K extends keyof SyncOptions>(key: K, value: SyncOptions[K]) =>
    setOpts((prev) => ({ ...prev, [key]: value }));

  const handleStart = async () => {
    if (!opts.sourceRemote) return setError("Select a source remote");
    if (!opts.destRemote) return setError("Select a destination remote");
    setError(null);
    setStarting(true);
    try {
      await startTransfer(opts);
      onStarted();
      onClose();
    } catch (e) {
      setError(String(e));
      setStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">New Transfer</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Operation picker */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Operation</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {(Object.keys(OP_LABELS) as TransferOp[]).map((op) => (
                <button
                  key={op}
                  onClick={() => set("op", op)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm transition
                    ${opts.op === op
                      ? "border-brand-500 bg-brand-600/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}
                >
                  <span className="text-xl">{OP_LABELS[op].icon}</span>
                  <span className="font-semibold">{OP_LABELS[op].label}</span>
                  <span className="text-[10px] text-white/40 text-center leading-tight">{OP_LABELS[op].desc}</span>
                </button>
              ))}
            </div>
            {opts.op === "sync" && (
              <div className="mt-2 rounded border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                Warning: "Make identical" deletes files on the destination that are not present in the source.
              </div>
            )}
          </div>

          {/* Source & Destination pickers side by side */}
          <div className="grid grid-cols-2 gap-4">
            <MiniPicker
              label="Source"
              remote={opts.sourceRemote}
              path={opts.sourcePath}
              onRemoteChange={(r) => set("sourceRemote", r)}
              onPathChange={(p) => set("sourcePath", p)}
              remotes={remotes}
            />
            <MiniPicker
              label="Destination"
              remote={opts.destRemote}
              path={opts.destPath}
              onRemoteChange={(r) => set("destRemote", r)}
              onPathChange={(p) => set("destPath", p)}
              remotes={remotes}
            />
          </div>

          {/* Options panel */}
          <details className="group rounded-xl border border-white/10 bg-white/[0.02]">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white/70 hover:text-white">
              ⚙️ Safety & performance
              <span className="ml-2 text-xs text-white/30 group-open:hidden">(click to expand)</span>
            </summary>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 px-4 py-4">
              <div className="col-span-2 flex flex-wrap gap-4">
                <Toggle label="Simulation mode (dry run)" checked={opts.dryRun} onChange={(v) => set("dryRun", v)} />
                <Toggle label="Use checksums" checked={opts.checksum} onChange={(v) => set("checksum", v)} />
                <Toggle label="Verbose logs" checked={opts.verbose} onChange={(v) => set("verbose", v)} />
                <Toggle label="Delete excluded" checked={opts.deleteExcluded} onChange={(v) => set("deleteExcluded", v)} />
                <Toggle label="No traverse" checked={opts.noTraverse} onChange={(v) => set("noTraverse", v)} />
                <Toggle label="Size only" checked={opts.sizeOnly} onChange={(v) => set("sizeOnly", v)} />
              </div>

              {/* Bandwidth limit */}
              <div>
                <label className="text-xs text-white/50">Bandwidth limit</label>
                <input
                  className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30"
                  value={opts.bandwidth}
                  onChange={(e) => set("bandwidth", e.target.value)}
                  placeholder="e.g. 10M, 1G (empty = unlimited)"
                />
              </div>

              {/* Transfers */}
              <div>
                <label className="text-xs text-white/50">Parallel transfers</label>
                <input
                  type="number"
                  min={1}
                  max={64}
                  className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
                  value={opts.transfers}
                  onChange={(e) => set("transfers", Number(e.target.value) || 4)}
                />
              </div>

              {/* Checkers */}
              <div>
                <label className="text-xs text-white/50">Parallel checkers</label>
                <input
                  type="number"
                  min={1}
                  max={64}
                  className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
                  value={opts.checkers}
                  onChange={(e) => set("checkers", Number(e.target.value) || 8)}
                />
              </div>

              {/* Include filter */}
              <div>
                <label className="text-xs text-white/50">Include filter</label>
                <input
                  className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30"
                  value={opts.filterInclude}
                  onChange={(e) => set("filterInclude", e.target.value)}
                  placeholder="e.g. *.jpg"
                />
              </div>

              {/* Exclude filter */}
              <div>
                <label className="text-xs text-white/50">Exclude filter</label>
                <input
                  className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30"
                  value={opts.filterExclude}
                  onChange={(e) => set("filterExclude", e.target.value)}
                  placeholder="e.g. *.tmp"
                />
              </div>

            </div>
          </details>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <div className="text-xs text-white/40 font-mono truncate max-w-[50%]">
            rclone {opts.op} {opts.sourceRemote}:{opts.sourcePath || "/"} → {opts.destRemote}:{opts.destPath || "/"}
            {opts.dryRun && " --dry-run"}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={starting || !opts.sourceRemote || !opts.destRemote}
              className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-40"
            >
              {starting ? "Starting…" : `Start ${OP_LABELS[opts.op].label}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──── Toggle helper ─────────────────────────────────────────────────

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-brand-600" : "bg-white/20"}`}
      >
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <span className="text-xs text-white/70">{label}</span>
    </label>
  );
}
