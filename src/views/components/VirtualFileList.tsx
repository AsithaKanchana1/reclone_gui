import { FixedSizeList as List, type ListChildComponentProps } from "react-window";
import type { RemoteEntry, DragFile, DropTarget } from "@/models/types";

type Props = {
  entries: RemoteEntry[];
  remote: string;
  currentPath: string;
  height: number;
  onNavigate: (entry: RemoteEntry) => void;
  getDragProps?: (file: DragFile) => Record<string, unknown>;
  getDropProps?: (target: DropTarget) => Record<string, unknown>;
  pendingKeys?: Set<string>;
};

function formatSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default function VirtualFileList({
  entries,
  remote,
  currentPath,
  height,
  onNavigate,
  getDragProps,
  getDropProps,
  pendingKeys,
}: Props) {
  const ROW_HEIGHT = 40;

  const Row = ({ index, style }: ListChildComponentProps) => {
    const entry = entries[index];
    const entryPath = currentPath ? `${currentPath}/${entry.Name}` : entry.Name;

    const dragProps = getDragProps
      ? getDragProps({ id: entryPath, name: entry.Name, path: entryPath, remote })
      : {};
    const dropProps = entry.IsDir && getDropProps
      ? getDropProps({ path: entryPath, remote })
      : {};

    const isPending = pendingKeys?.has(`${remote}:${entryPath}`) ?? false;

    return (
      <div
        style={style}
        className={`flex items-center gap-3 border-b border-white/5 px-4 text-sm transition
          ${entry.IsDir ? "cursor-pointer hover:bg-white/5" : ""}
          ${isPending ? "animate-pulse bg-yellow-900/20" : ""}`}
        onClick={() => onNavigate(entry)}
        {...dragProps}
        {...dropProps}
      >
        <span className="w-5 text-center text-base">
          {isPending ? "⏳" : entry.IsDir ? "📁" : "📄"}
        </span>
        <span className="flex-1 truncate text-white/90">{entry.Name}</span>
        {!entry.IsDir && (
          <span className="text-xs text-white/40">{formatSize(entry.Size)}</span>
        )}
      </div>
    );
  };

  if (!entries.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-white/40">
        Empty folder
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={entries.length}
      itemSize={ROW_HEIGHT}
      width="100%"
    >
      {Row}
    </List>
  );
}
