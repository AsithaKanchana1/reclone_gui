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

// ──── Transfer progress (matches Rust RcloneProgress) ───────────────

export interface TransferProgress {
  op: string;
  source: string;
  destination: string;
  percentage: number;
  speed: string;
  eta: string;
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
