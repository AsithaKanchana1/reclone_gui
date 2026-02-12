// ──── Remote ────────────────────────────────────────────────────────

export type ServiceType = "gdrive" | "dropbox" | "s3" | "onedrive" | "sftp" | "ftp" | "mega" | "other";

export interface Remote {
  name: string;
  service: ServiceType;
}

// ──── File entry (matches Rust RemoteEntry) ─────────────────────────

export interface RemoteEntry {
  Path: string;
  Name: string;
  Size: number;
  MimeType: string | null;
  ModTime: string | null;
  IsDir: boolean;
}

// ──── Transfer ──────────────────────────────────────────────────────

export type TransferOp = "sync" | "copy" | "move" | "check";
export type TransferStatus = "running" | "complete" | "error" | "cancelled";

export interface TransferProgress {
  id: string;
  op: string;
  source: string;
  destination: string;
  percentage: number;
  speed: string;
  eta: string;
  status: TransferStatus;
}

// ──── Sync options (GUI‑selectable rclone flags) ────────────────────

export interface SyncOptions {
  op: TransferOp;
  sourceRemote: string;
  sourcePath: string;
  destRemote: string;
  destPath: string;
  dryRun: boolean;
  bandwidth: string;          // e.g. "10M", "" for unlimited
  transfers: number;          // parallel file transfers (default 4)
  checkers: number;           // parallel checkers (default 8)
  deleteExcluded: boolean;
  verbose: boolean;
  filterInclude: string;      // --include pattern
  filterExclude: string;      // --exclude pattern
  noTraverse: boolean;
  sizeOnly: boolean;
  checksum: boolean;
}

export const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  op: "sync",
  sourceRemote: "",
  sourcePath: "",
  destRemote: "",
  destPath: "",
  dryRun: false,
  bandwidth: "",
  transfers: 4,
  checkers: 8,
  deleteExcluded: false,
  verbose: false,
  filterInclude: "",
  filterExclude: "",
  noTraverse: false,
  sizeOnly: false,
  checksum: true,
};

// ──── Disk usage ────────────────────────────────────────────────────

export interface RemoteAbout {
  total: number | null;
  used: number | null;
  free: number | null;
  trashed: number | null;
}

// ──── DnD ───────────────────────────────────────────────────────────

export interface DragFile {
  id: string;
  name: string;
  path: string;
  remote: string;
}

export interface DropTarget {
  path: string;
  remote: string;
}

// ──── UI navigation ─────────────────────────────────────────────────

export type AppView = "dashboard" | "about";

// ──── Config dump ──────────────────────────────────────────────────

export type RemoteConfigDump = Record<string, Record<string, string>>;
