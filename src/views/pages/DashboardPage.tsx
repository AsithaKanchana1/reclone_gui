import { useState } from "react";
import type { Remote } from "@/models/types";
import { useTransfers } from "@/controllers/useTransfers";
import RemoteCard from "@/views/components/RemoteCard";
import FileBrowser from "@/views/components/FileBrowser";
import TransferOverlay from "@/views/components/TransferOverlay";
import SyncDialog from "@/views/components/SyncDialog";

type Props = {
  remotes: Remote[];
  selectedRemote: string;
  onSelectRemote: (name: string) => void;
  onEditRemote: (name: string) => void;
};

export default function DashboardPage({ remotes, selectedRemote, onSelectRemote, onEditRemote }: Props) {
  const { transfers, cancel, dismiss } = useTransfers();
  const [destRemote, setDestRemote] = useState("");

  // Sync dialog state
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncSource, setSyncSource] = useState("");
  const [syncSourcePath, setSyncSourcePath] = useState("");
  const [syncDest, setSyncDest] = useState("");

  const openSyncDialog = (sourceRemote?: string, sourcePath?: string, destRemoteName?: string) => {
    setSyncSource(sourceRemote || selectedRemote);
    setSyncSourcePath(sourcePath || "");
    setSyncDest(destRemoteName || destRemote || "");
    setSyncDialogOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        </div>
        <button
          onClick={() => openSyncDialog()}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          <span>🔄</span> New Transfer
        </button>
      </header>

      {/* Remote cards */}
      <section className="border-b border-white/10 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {remotes.map((r) => (
            <RemoteCard
              key={r.name}
              remote={r}
              onSync={() => openSyncDialog(r.name)}
              onSelect={onSelectRemote}
              onEdit={() => onEditRemote(r.name)}
            />
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
          <FileBrowser
            remote={selectedRemote}
            label={`Source: ${selectedRemote}`}
            onTransfer={(path) => openSyncDialog(selectedRemote, path)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-white/30">
            Select a remote from the sidebar
          </div>
        )}
        {destRemote ? (
          <FileBrowser
            remote={destRemote}
            label={`Dest: ${destRemote}`}
            onTransfer={(path) => openSyncDialog(destRemote, path)}
          />
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
      <TransferOverlay transfers={transfers} onCancel={cancel} onDismiss={dismiss} />

      {/* Sync Dialog */}
      {syncDialogOpen && (
        <SyncDialog
          remotes={remotes}
          initialSource={syncSource}
          initialSourcePath={syncSourcePath}
          initialDest={syncDest}
          onClose={() => setSyncDialogOpen(false)}
          onStarted={() => {}}
        />
      )}
    </div>
  );
}
