import { useEffect, useRef } from "react";
import type { RemoteEntry } from "@/models/types";

export type ContextAction = "copy" | "move" | "sync" | "delete" | "mkdir" | "refresh" | "rename" | "link";

type Props = {
  x: number;
  y: number;
  entry: RemoteEntry | null; // null = background click
  onAction: (action: ContextAction) => void;
  onClose: () => void;
};

export default function FileContextMenu({ x, y, entry, onAction, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const items: { action: ContextAction; label: string; icon: string; danger?: boolean }[] = entry
    ? [
        { action: "copy", label: "Copy to…", icon: "📋" },
        { action: "move", label: "Move to…", icon: "📦" },
        { action: "sync", label: "Sync to…", icon: "🔄" },
        { action: "rename", label: "Rename", icon: "✏️" },
        { action: "link", label: "Public link", icon: "🔗" },
        { action: "delete", label: "Delete", icon: "🗑️", danger: true },
      ]
    : [
        { action: "mkdir", label: "New folder", icon: "📁" },
        { action: "refresh", label: "Refresh", icon: "🔃" },
      ];

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[160px] rounded-xl border border-white/10 bg-slate-800 py-1 shadow-2xl"
      style={{ left: x, top: y }}
    >
      {entry && (
        <div className="border-b border-white/10 px-3 py-2 text-xs text-white/40 truncate max-w-[200px]">
          {entry.IsDir ? "📁" : "📄"} {entry.Name}
        </div>
      )}
      {items.map((item) => (
        <button
          key={item.action}
          onClick={() => { onAction(item.action); onClose(); }}
          className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-white/10 ${
            item.danger ? "text-red-400 hover:text-red-300" : "text-white/80 hover:text-white"
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
