import { useState } from "react";
import type { Remote } from "@/models/types";
import { startSync } from "@/services/rcloneApi";
import { useTransfers } from "@/controllers/useTransfers";
import RemoteCard from "@/views/components/RemoteCard";
import FileBrowser from "@/views/components/FileBrowser";
import TransferOverlay from "@/views/components/TransferOverlay";

type Props = {
  remotes: Remote[];
  selectedRemote: string;
  onSelectRemote: (name: string) => void;
};

export default function DashboardPage({ remotes, selectedRemote, onSelectRemote }: Props) {
  const { transfer, dismiss } = useTransfers();
  const [destination, setDestination] = useState("");
  const [destRemote, setDestRemote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSync = (remoteName: string) => {
    if (!destination) {
      setError("Set a destination path first.");
      return;
    }
    setError(null);
    startSync(`${remoteName}:`, destination).catch((e) => setError(String(e)));
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-72 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/40"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Sync destination (e.g. local:/home/user/backup)"
          />
        </div>
      </header>

      {/* Remote cards */}
      <section className="border-b border-white/10 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {remotes.map((r) => (
            <RemoteCard key={r.name} remote={r} onSync={handleSync} onSelect={onSelectRemote} />
          ))}
          {!remotes.length && (
            <p className="col-span-full text-center text-sm text-white/40 py-8">
              No rclone remotes found. Run <code className="bg-white/10 px-1 rounded">rclone config</code> to add one.
            </p>
          )}
        </div>
      </section>

      {/* Dual file browsers */}
      <section className="flex flex-1 gap-2 overflow-hidden p-4">
        {selectedRemote ? (
          <FileBrowser remote={selectedRemote} label={`Source: ${selectedRemote}`} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-white/30">
            Select a remote from the sidebar
          </div>
        )}
        {destRemote ? (
          <FileBrowser remote={destRemote} label={`Dest: ${destRemote}`} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 text-sm text-white/30">
            <p>Pick a destination remote</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {remotes
                .filter((r) => r.name !== selectedRemote)
                .map((r) => (
                  <button
                    key={r.name}
                    onClick={() => setDestRemote(r.name)}
                    className="rounded bg-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/20 hover:text-white"
                  >
                    {r.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* Bottom transfer bar */}
      <TransferOverlay transfer={transfer} onCancel={dismiss} />
    </div>
  );
}
