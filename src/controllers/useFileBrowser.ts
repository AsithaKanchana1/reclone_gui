import { useCallback, useEffect, useState } from "react";
import { fetchFiles } from "@/services/rcloneApi";
import type { RemoteEntry } from "@/models/types";

export function useFileBrowser(remote: string) {
  const [path, setPath] = useState("");
  const [entries, setEntries] = useState<RemoteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!remote) return;
    setLoading(true);
    setError(null);
    fetchFiles(remote, path)
      .then(setEntries)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [remote, path]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPath(""); }, [remote]);

  const navigate = (entry: RemoteEntry) => {
    if (entry.IsDir) {
      setPath((prev) => (prev ? `${prev}/${entry.Name}` : entry.Name));
    }
  };

  const goUp = () => {
    setPath((prev) => {
      const parts = prev.split("/").filter(Boolean);
      parts.pop();
      return parts.join("/");
    });
  };

  return { path, entries, loading, error, navigate, goUp, refresh: load, setPath };
}
