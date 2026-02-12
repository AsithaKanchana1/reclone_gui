import type { Remote, ServiceType } from "@/models/types";

const palette: Record<ServiceType, string> = {
  gdrive: "from-cyan-500 to-sky-600",
  dropbox: "from-indigo-500 to-blue-600",
  s3: "from-amber-500 to-orange-600",
  onedrive: "from-blue-600 to-slate-700",
  sftp: "from-violet-500 to-purple-700",
  ftp: "from-teal-500 to-emerald-700",
  mega: "from-red-500 to-rose-700",
  other: "from-slate-600 to-slate-800",
};

const icons: Record<ServiceType, string> = {
  gdrive: "☁️",
  dropbox: "📦",
  s3: "🪣",
  onedrive: "💠",
  sftp: "🔐",
  ftp: "📂",
  mega: "🔷",
  other: "💾",
};

type Props = {
  remote: Remote;
  onSync: () => void;
  onSelect: (name: string) => void;
  onEdit: () => void;
};

export default function RemoteCard({ remote, onSync, onSelect, onEdit }: Props) {
  const bg = palette[remote.service];
  return (
    <div
      className={`relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br ${bg} p-4 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl`}
      onClick={() => onSelect(remote.name)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icons[remote.service]}</span>
          <div>
            <div className="text-xs uppercase tracking-wide text-white/70">Remote</div>
            <div className="text-lg font-semibold text-white">{remote.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-white">
            {remote.service}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="rounded bg-white/15 px-2 py-1 text-[11px] text-white/80 hover:bg-white/25"
            title="Edit remote"
          >
            ✎
          </button>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-white"
          onClick={(e) => { e.stopPropagation(); onSync(); }}
        >
          🔄 Transfer
        </button>
      </div>
    </div>
  );
}
