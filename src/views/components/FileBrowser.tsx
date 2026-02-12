import { useRef, useState, useLayoutEffect } from "react";
import { useFileBrowser } from "@/controllers/useFileBrowser";
import { useRemoteDnD } from "@/controllers/useRemoteDnD";
import VirtualFileList from "./VirtualFileList";

type Props = { remote: string; label: string };

export default function FileBrowser({ remote, label }: Props) {
  const { path, entries, loading, error, navigate, goUp, refresh } = useFileBrowser(remote);
  const { getDragProps, getDropProps, pendingLookup } = useRemoteDnD();
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(400);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => setHeight(e.contentRect.height));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="text-sm font-semibold text-white/80">{label}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={goUp}
            disabled={!path}
            className="rounded px-2 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            ⬆ Up
          </button>
          <button
            onClick={refresh}
            className="rounded px-2 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-white/5 px-4 py-1.5 text-xs text-white/40 font-mono truncate">
        {remote}:{path || "/"}
      </div>

      {/* File list */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-white/40">
            Loading…
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-red-400">
            {error}
          </div>
        ) : (
          <VirtualFileList
            entries={entries}
            remote={remote}
            currentPath={path}
            height={height}
            onNavigate={navigate}
            getDragProps={getDragProps}
            getDropProps={getDropProps}
            pendingKeys={pendingLookup}
          />
        )}
      </div>
    </div>
  );
}
