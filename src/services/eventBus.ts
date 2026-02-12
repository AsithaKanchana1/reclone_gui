import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { TransferProgress } from "@/models/types";

export type ProgressHandler = (progress: TransferProgress) => void;

/** Subscribe to sync‑progress events. Returns an unlisten function. */
export const onSyncProgress = (handler: ProgressHandler): Promise<UnlistenFn> =>
  listen<TransferProgress>("rclone-sync-progress", (ev) => handler(ev.payload));

/** Subscribe to copy‑progress events. Returns an unlisten function. */
export const onCopyProgress = (handler: ProgressHandler): Promise<UnlistenFn> =>
  listen<TransferProgress>("rclone-copy-progress", (ev) => handler(ev.payload));
