import { useCallback, useEffect, useState } from "react";
import { fetchRemotes } from "@/services/rcloneApi";
import type { Remote, ServiceType } from "@/models/types";

function inferService(name: string): ServiceType {
  const k = name.toLowerCase();
  if (k.includes("gdrive") || k.includes("google")) return "gdrive";
  if (k.includes("dropbox")) return "dropbox";
  if (k.includes("s3") || k.includes("aws")) return "s3";
  if (k.includes("onedrive")) return "onedrive";
  if (k.includes("sftp") || k.includes("ssh")) return "sftp";
  if (k.includes("ftp")) return "ftp";
  if (k.includes("mega")) return "mega";
  return "other";
}

export function useRemotes() {
  const [remotes, setRemotes] = useState<Remote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchRemotes()
      .then((names) => setRemotes(names.map((n) => ({ name: n, service: inferService(n) }))))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { remotes, loading, error, refresh };
}
