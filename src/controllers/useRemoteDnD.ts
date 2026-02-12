import type { DragEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { startCopy } from "@/services/rcloneApi";
import type { DragFile, DropTarget } from "@/models/types";

type PendingMap = Record<string, boolean>;

export function useRemoteDnD() {
  const [pendingTargets, setPendingTargets] = useState<PendingMap>({});
  const activeTransfers = useRef<Set<string>>(new Set());
  const draggedItem = useRef<DragFile | null>(null);

  const transferKey = (src: DragFile, dest: DropTarget) =>
    `${src.remote}:${src.path}->${dest.remote}:${dest.path}`;

  const startTransfer = async (src: DragFile, dest: DropTarget) => {
    const key = transferKey(src, dest);
    if (activeTransfers.current.has(key)) return; // prevent duplicate

    activeTransfers.current.add(key);
    setPendingTargets((prev) => ({ ...prev, [key]: true }));

    try {
      await startCopy(`${src.remote}:${src.path}`, `${dest.remote}:${dest.path}/${src.name}`);
    } finally {
      activeTransfers.current.delete(key);
      setPendingTargets((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const getDragProps = (file: DragFile) => ({
    draggable: true as const,
    onDragStart: () => { draggedItem.current = file; },
    onDragEnd: () => { draggedItem.current = null; },
  });

  const getDropProps = (target: DropTarget) => ({
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      if (!draggedItem.current) return;
      startTransfer(draggedItem.current, target);
    },
  });

  const pendingLookup = useMemo(() => new Set(Object.keys(pendingTargets)), [pendingTargets]);

  return { getDragProps, getDropProps, pendingLookup };
}
