import { useEffect, useState } from "react";
import { onSyncProgress, onCopyProgress } from "@/services/eventBus";
import type { TransferProgress } from "@/models/types";

export function useTransfers() {
  const [transfer, setTransfer] = useState<TransferProgress | null>(null);

  useEffect(() => {
    const unsubs = [
      onSyncProgress((p) => setTransfer(p)),
      onCopyProgress((p) => setTransfer(p)),
    ];
    return () => {
      unsubs.forEach((p) => p.then((f) => f()));
    };
  }, []);

  const dismiss = () => setTransfer(null);

  return { transfer, dismiss };
}
