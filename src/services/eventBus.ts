import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { TransferProgress } from "@/models/types";

export type ProgressHandler = (progress: TransferProgress) => void;

/** Subscribe to all rclone transfer progress events. Returns an unlisten function. */
export const onProgress = (handler: ProgressHandler): Promise<UnlistenFn> =>
  listen<TransferProgress>("rclone-progress", (ev) => handler(ev.payload));
