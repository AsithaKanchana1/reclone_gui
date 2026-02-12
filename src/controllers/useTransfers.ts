import { useEffect, useState, useCallback } from "react";
import { onProgress } from "@/services/eventBus";
import { cancelTransfer } from "@/services/rcloneApi";
import type { TransferProgress } from "@/models/types";

/**
 * Manages multiple concurrent transfers.
 * Keeps a map of transfer-id → latest progress.
 */
export function useTransfers() {
  const [transfers, setTransfers] = useState<Record<string, TransferProgress>>({});

  useEffect(() => {
    const unsub = onProgress((p) => {
      setTransfers((prev) => {
        // If final status (complete / error / cancelled), keep it briefly then auto-remove
        if (p.status !== "running") {
          const next = { ...prev, [p.id]: p };
          // Remove finished transfers after 5 s
          setTimeout(() => {
            setTransfers((curr) => {
              const { [p.id]: _, ...rest } = curr;
              return rest;
            });
          }, 5000);
          return next;
        }
        return { ...prev, [p.id]: p };
      });
    });
    return () => { unsub.then((f) => f()); };
  }, []);

  const cancel = useCallback((id: string) => {
    cancelTransfer(id).catch(console.error);
  }, []);

  const dismiss = useCallback((id: string) => {
    setTransfers((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const activeTransfers = Object.values(transfers);

  return { transfers: activeTransfers, cancel, dismiss };
}
