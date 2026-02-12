import { useEffect, useMemo, useState } from "react";
import { createRemote, fetchConfigDump, updateRemote } from "@/services/rcloneApi";

const PROVIDERS = [
  { value: "drive", label: "Google Drive" },
  { value: "s3", label: "Amazon S3 / S3" },
  { value: "dropbox", label: "Dropbox" },
  { value: "onedrive", label: "OneDrive" },
  { value: "webdav", label: "WebDAV" },
  { value: "sftp", label: "SFTP" },
  { value: "ftp", label: "FTP" },
  { value: "mega", label: "MEGA" },
  { value: "other", label: "Other (manual)" },
];

type FieldRow = { key: string; value: string; id: string };

type Props = {
  mode: "create" | "edit";
  remoteName?: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function RemoteWizard({ mode, remoteName, onClose, onSaved }: Props) {
  const [name, setName] = useState(remoteName || "");
  const [provider, setProvider] = useState<string>("drive");
  const [fields, setFields] = useState<FieldRow[]>([{ key: "", value: "", id: "row-0" }]);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !remoteName) return;
    setLoading(true);
    fetchConfigDump()
      .then((dump) => {
        const entry = dump[remoteName];
        if (!entry) return;
        const { type, ...rest } = entry;
        setProvider(type || "other");
        const rows = Object.entries(rest).map(([k, v], idx) => ({ key: k, value: v, id: `row-${idx}` }));
        setFields(rows.length ? rows : [{ key: "", value: "", id: "row-0" }]);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [mode, remoteName]);

  const canSave = useMemo(() => name.trim().length > 0 && provider.trim().length > 0, [name, provider]);

  const upsertField = (id: string, key: string, value: string) => {
    setFields((rows) => rows.map((r) => (r.id === id ? { ...r, key, value } : r)));
  };

  const addRow = () => setFields((rows) => [...rows, { key: "", value: "", id: `row-${rows.length}` }]);
  const removeRow = (id: string) => setFields((rows) => (rows.length === 1 ? rows : rows.filter((r) => r.id !== id)));

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const payload: Record<string, string> = {};
    fields.forEach((r) => {
      if (r.key.trim()) payload[r.key.trim()] = r.value.trim();
    });

    try {
      if (mode === "create") {
        await createRemote(name.trim(), provider.trim(), payload);
      } else if (remoteName) {
        await updateRemote(remoteName, payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">Connection Wizard</div>
            <h2 className="text-lg font-semibold text-white">{mode === "create" ? "Add new remote" : `Edit ${remoteName}`}</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading ? (
            <div className="text-sm text-white/60">Loading configuration…</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50">Name</label>
                  <input
                    value={name}
                    disabled={mode === "edit"}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-50"
                    placeholder="mydrive"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-sm text-white/70">
                  <span>Key / value settings</span>
                  <button onClick={addRow} className="rounded bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/20">+ Add field</button>
                </div>
                <div className="divide-y divide-white/5">
                  {fields.map((row) => (
                    <div key={row.id} className="grid grid-cols-[1fr,1fr,auto] gap-2 px-4 py-2 items-center">
                      <input
                        value={row.key}
                        onChange={(e) => upsertField(row.id, e.target.value, row.value)}
                        placeholder="client_id / access_key / token / …"
                        className="rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
                      />
                      <input
                        value={row.value}
                        onChange={(e) => upsertField(row.id, row.key, e.target.value)}
                        placeholder="value"
                        className="rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
                      />
                      <button
                        onClick={() => removeRow(row.id)}
                        className="text-xs text-white/40 hover:text-white px-2"
                        title="Remove"
                        disabled={fields.length === 1}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-white/40">
                Tip: This runs <code className="bg-white/10 px-1 rounded">rclone config {mode === "create" ? "create" : "update"}</code> behind the scenes.
              </p>

              {error && (
                <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <div className="text-xs text-white/50">Your rclone config file will be updated in-place.</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!canSave || saving || loading}
              className="rounded bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-40"
            >
              {saving ? "Saving…" : mode === "create" ? "Create remote" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
