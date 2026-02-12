import { useRef, useState, useLayoutEffect, useCallback } from "react";
import { useFileBrowser } from "@/controllers/useFileBrowser";
import { useRemoteDnD } from "@/controllers/useRemoteDnD";
import { deleteItem, mkdir } from "@/services/rcloneApi";
import VirtualFileList from "./VirtualFileList";
import FileContextMenu, { type ContextAction } from "./FileContextMenu";
import type { RemoteEntry } from "@/models/types";

type Props = {
  remote: string;
  label: string;
  onTransfer?: (path: string) => void;
};

export default function FileBrowser({ remote, label, onTransfer }: Props) {
  const { path, entries, loading, error, navigate, goUp, refresh } = useFileBrowser(remote);
  const { getDragProps, getDropProps, pendingLookup } = useRemoteDnD();
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(400);

  // Context menu state
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; entry: RemoteEntry | null } | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => setHeight(e.contentRect.height));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, entry: RemoteEntry | null) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, entry });
  }, []);

  const handleContextAction = useCallback(async (action: ContextAction) => {
    const entry = ctxMenu?.entry;
    setCtxMenu(null);

    switch (action) {
      case "delete":
        if (entry && confirm(`Delete "${entry.Name}"?`)) {
          try {
            const entryPath = path ? `${path}/${entry.Name}` : entry.Name;
            await deleteItem(remote, entryPath, entry.IsDir);
            refresh();
          } catch (e) {
            alert(`Delete failed: ${e}`);
          }
        }
        break;
      case "mkdir": {
        const name = prompt("New folder name:");
        if (name) {
          try {
            const mkPath = path ? `${path}/${name}` : name;
            await mkdir(remote, mkPath);
            refresh();
          } catch (e) {
            alert(`Create folder failed: ${e}`);
          }
        }
        break;
      }
      case "copy":
      case "move":
      case "sync":
        if (onTransfer) {
          const entryPath = entry ? (path ? `${path}/${entry.Name}` : entry.Name) : path;
          onTransfer(entryPath);
        }
        break;
      case "refresh":
        refresh();
        break;
    }
  }, [ctxMenu, path, remote, refresh, onTransfer]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="text-sm font-semibold text-white/80">{label}</div>
        <div className="flex items-center gap-2">
          {onTransfer && (
            <button
              onClick={() => onTransfer(path)}
              className="rounded bg-brand-600/80 px-2 py-1 text-xs text-white transition hover:bg-brand-500"
              title="Start transfer from here"
            >
              🔄 Transfer
            </button>
          )}
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
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onContextMenu={(e) => handleContextMenu(e, null)}
      >
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
            onContextMenu={handleContextMenu}
          />
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <FileContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          entry={ctxMenu.entry}
          onAction={handleContextAction}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}
