import { invoke } from "@tauri-apps/api/core";
import type { RemoteEntry } from "@/models/types";

/** Fetch configured rclone remotes. */
export const fetchRemotes = () => invoke<string[]>("get_rclone_remotes");

/** List files in a remote path. */
export const fetchFiles = (remote: string, path: string) =>
  invoke<RemoteEntry[]>("list_remote_files", { remote, path });

/** Start rclone sync. */
export const startSync = (source: string, destination: string, flags: string[] = []) =>
  invoke<void>("run_rclone_sync", { source, destination, flags });

/** Start rclone copy. */
export const startCopy = (source: string, destination: string, flags: string[] = []) =>
  invoke<void>("run_rclone_copy", { source, destination, flags });
