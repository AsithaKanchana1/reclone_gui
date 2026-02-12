import { invoke } from "@tauri-apps/api/core";
import type { RemoteEntry, RemoteAbout, SyncOptions, RemoteConfigDump } from "@/models/types";

// ──── Query ─────────────────────────────────────────────────────────

/** Fetch configured rclone remotes. */
export const fetchRemotes = () => invoke<string[]>("get_rclone_remotes");

/** List files in a remote path. */
export const fetchFiles = (remote: string, path: string) =>
  invoke<RemoteEntry[]>("list_remote_files", { remote, path });

/** Get disk usage for a remote. */
export const fetchAbout = (remote: string) =>
  invoke<RemoteAbout>("get_remote_about", { remote });

// ──── File operations ───────────────────────────────────────────────

/** Create a directory on a remote. */
export const mkdir = (remote: string, path: string) =>
  invoke<void>("rclone_mkdir", { remote, path });

/** Delete a file or directory on a remote. */
export const deleteItem = (remote: string, path: string, isDir: boolean) =>
  invoke<void>("rclone_delete", { remote, path, isDir });

/** Rename a file or folder on a remote. */
export const renameItem = (remote: string, oldPath: string, newPath: string) =>
  invoke<void>("rclone_rename", { remote, oldPath, newPath });

/** Generate a public link for a remote path (if supported). */
export const linkItem = (remote: string, path: string) =>
  invoke<string>("rclone_link", { remote, path });

// ──── Transfers (return transfer ID for tracking) ───────────────────

/** Build the flags array from SyncOptions. */
function buildFlags(opts: SyncOptions): string[] {
  const flags: string[] = [];
  if (opts.dryRun) flags.push("--dry-run");
  if (opts.verbose) flags.push("-v");
  if (opts.bandwidth) flags.push("--bwlimit", opts.bandwidth);
  if (opts.transfers !== 4) flags.push("--transfers", String(opts.transfers));
  if (opts.checkers !== 8) flags.push("--checkers", String(opts.checkers));
  if (opts.deleteExcluded) flags.push("--delete-excluded");
  if (opts.filterInclude) flags.push("--include", opts.filterInclude);
  if (opts.filterExclude) flags.push("--exclude", opts.filterExclude);
  if (opts.noTraverse) flags.push("--no-traverse");
  if (opts.sizeOnly) flags.push("--size-only");
  if (opts.checksum) flags.push("--checksum");
  return flags;
}

function formatRemotePath(remote: string, path: string): string {
  return path ? `${remote}:${path}` : `${remote}:`;
}

/** Start a transfer based on SyncOptions. Returns the transfer UUID. */
export async function startTransfer(opts: SyncOptions): Promise<string> {
  const source = formatRemotePath(opts.sourceRemote, opts.sourcePath);
  const destination = formatRemotePath(opts.destRemote, opts.destPath);
  const flags = buildFlags(opts);

  switch (opts.op) {
    case "sync":
      return invoke<string>("run_rclone_sync", { source, destination, flags });
    case "copy":
      return invoke<string>("run_rclone_copy", { source, destination, flags });
    case "move":
      return invoke<string>("run_rclone_move", { source, destination, flags });
    case "check":
      return invoke<string>("run_rclone_check", { source, destination, flags });
  }
}

/** Start rclone sync (simple). */
export const startSync = (source: string, destination: string, flags: string[] = []) =>
  invoke<string>("run_rclone_sync", { source, destination, flags });

/** Start rclone copy (simple). */
export const startCopy = (source: string, destination: string, flags: string[] = []) =>
  invoke<string>("run_rclone_copy", { source, destination, flags });

/** Cancel a running transfer by ID. */
export const cancelTransfer = (id: string) =>
  invoke<boolean>("cancel_transfer", { id });

// ──── Config management ───────────────────────────────────────────

export const fetchConfigDump = () => invoke<RemoteConfigDump>("rclone_config_dump");

export const createRemote = (name: string, provider: string, params: Record<string, string>) =>
  invoke<void>("rclone_config_create", { name, provider, params });

export const updateRemote = (name: string, params: Record<string, string>) =>
  invoke<void>("rclone_config_update", { name, params });
