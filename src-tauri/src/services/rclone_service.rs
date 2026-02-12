use crate::models::progress::{RcloneProgress, RemoteAbout, TransferStatus};
use crate::models::remote::RemoteEntry;
use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;

// ──── Active process registry (for cancellation) ──────────────────

lazy_static::lazy_static! {
    static ref ACTIVE_PROCESSES: Mutex<HashMap<String, u32>> = Mutex::new(HashMap::new());
}

pub fn register_process(id: &str, pid: u32) {
    ACTIVE_PROCESSES.lock().unwrap().insert(id.to_string(), pid);
}

pub fn unregister_process(id: &str) {
    ACTIVE_PROCESSES.lock().unwrap().remove(id);
}

/// Kill a running rclone process by transfer id. Returns true if found and killed.
pub fn cancel_transfer(id: &str) -> Result<bool, String> {
    let pid = ACTIVE_PROCESSES.lock().unwrap().get(id).copied();
    if let Some(pid) = pid {
        #[cfg(unix)]
        {
            unsafe { libc::kill(pid as i32, libc::SIGTERM); }
        }
        #[cfg(windows)]
        {
            let _ = Command::new("taskkill")
                .args(["/PID", &pid.to_string(), "/F"])
                .output();
        }
        unregister_process(id);
        Ok(true)
    } else {
        Ok(false)
    }
}

// ──── Query helpers ─────────────────────────────────────────────────

/// Run `rclone listremotes` and return a list of remote names (without trailing `:` ).
pub fn list_remotes() -> Result<Vec<String>, String> {
    let output = Command::new("rclone")
        .args(["listremotes", "--use-json-log"])
        .output()
        .map_err(|e| format!("Failed to run rclone: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let remotes = String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|l| l.trim_end_matches(':').to_string())
        .filter(|l| !l.is_empty())
        .collect();

    Ok(remotes)
}

/// Run `rclone lsjson` to list files/dirs in a remote path.
pub fn list_files(remote: &str, path: &str) -> Result<Vec<RemoteEntry>, String> {
    let remote_path = if path.is_empty() {
        format!("{}:", remote)
    } else {
        format!("{}:{}", remote, path)
    };

    let output = Command::new("rclone")
        .args(["lsjson", &remote_path, "--use-json-log"])
        .output()
        .map_err(|e| format!("Failed to run rclone lsjson: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let entries: Vec<RemoteEntry> = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse rclone output: {}", e))?;

    Ok(entries)
}

/// Run `rclone about remote:` to get disk usage.
pub fn about(remote: &str) -> Result<RemoteAbout, String> {
    let output = Command::new("rclone")
        .args(["about", &format!("{}:", remote), "--json"])
        .output()
        .map_err(|e| format!("Failed to run rclone about: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse rclone about output: {}", e))
}

// ──── Single-shot commands (no progress stream) ─────────────────────

/// Run `rclone mkdir remote:path`.
pub fn mkdir(remote: &str, path: &str) -> Result<(), String> {
    let remote_path = format!("{}:{}", remote, path);
    let output = Command::new("rclone")
        .args(["mkdir", &remote_path])
        .output()
        .map_err(|e| format!("Failed to run rclone mkdir: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

/// Run `rclone deletefile remote:path` or `rclone purge remote:path` for directories.
pub fn delete(remote: &str, path: &str, is_dir: bool) -> Result<(), String> {
    let remote_path = format!("{}:{}", remote, path);
    let cmd = if is_dir { "purge" } else { "deletefile" };
    let output = Command::new("rclone")
        .args([cmd, &remote_path])
        .output()
        .map_err(|e| format!("Failed to run rclone {}: {}", cmd, e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

/// Run `rclone moveto remote:old remote:new` to rename an entry.
pub fn rename(remote: &str, old_path: &str, new_path: &str) -> Result<(), String> {
    let old_full = format!("{}:{}", remote, old_path);
    let new_full = format!("{}:{}", remote, new_path);
    let output = Command::new("rclone")
        .args(["moveto", &old_full, &new_full])
        .output()
        .map_err(|e| format!("Failed to run rclone moveto: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

/// Run `rclone link remote:path` to get a public URL (if the backend supports linking).
pub fn link(remote: &str, path: &str) -> Result<String, String> {
    let full = format!("{}:{}", remote, path);
    let output = Command::new("rclone")
        .args(["link", &full])
        .output()
        .map_err(|e| format!("Failed to run rclone link: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

// ──── Config management ────────────────────────────────────────────

/// Dump the current rclone config as JSON.
pub fn config_dump() -> Result<serde_json::Value, String> {
    let output = Command::new("rclone")
        .args(["config", "dump", "--json"])
        .output()
        .map_err(|e| format!("Failed to run rclone config dump: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse rclone config dump: {}", e))
}

/// Create a new remote via `rclone config create name provider key value...`.
pub fn config_create(name: &str, provider: &str, params: &HashMap<String, String>) -> Result<(), String> {
    let mut args = vec!["config", "create", name, provider];
    for (k, v) in params {
        args.push(k);
        args.push(v);
    }

    let output = Command::new("rclone")
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to run rclone config create: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

/// Update an existing remote via `rclone config update name key value...`.
pub fn config_update(name: &str, params: &HashMap<String, String>) -> Result<(), String> {
    if params.is_empty() {
        return Ok(());
    }

    let mut args = vec!["config", "update", name];
    for (k, v) in params {
        args.push(k);
        args.push(v);
    }

    let output = Command::new("rclone")
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to run rclone config update: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

// ──── Streaming transfers ──────────────────────────────────────────

/// Spawn an rclone transfer process (`sync`, `copy`, `move`, `check`).
pub fn spawn_transfer(op: &str, source: &str, dest: &str, flags: &[String]) -> Result<Child, String> {
    let mut args: Vec<String> = vec![
        op.to_string(),
        source.to_string(),
        dest.to_string(),
        "--use-json-log".to_string(),
        "--stats".to_string(),
        "1s".to_string(),
        "--stats-log-level".to_string(),
        "NOTICE".to_string(),
        "--log-format".to_string(),
        "json".to_string(),
    ];
    args.extend_from_slice(flags);

    Command::new("rclone")
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start rclone: {}", e))
}

/// Parse rclone JSON log lines from stderr, calling `on_progress` for each parsed tick.
pub fn stream_progress<F>(
    child: &mut Child,
    transfer_id: &str,
    op: &str,
    source: &str,
    dest: &str,
    mut on_progress: F,
) -> Result<(), String>
where
    F: FnMut(RcloneProgress),
{
    // Register for cancellation
    register_process(transfer_id, child.id());

    let stderr = child.stderr.take().ok_or("Missing rclone stderr")?;
    let reader = BufReader::new(stderr);

    for line in reader.lines() {
        let line = line.map_err(|e| format!("Failed to read rclone output: {}", e))?;
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&line) {
            if let Some(progress) = parse_progress(&json, transfer_id, op, source, dest) {
                on_progress(progress);
            }
        }
    }

    unregister_process(transfer_id);

    let status = child.wait().map_err(|e| format!("Failed to wait for rclone: {}", e))?;

    // Emit final status
    let final_status = if status.success() {
        TransferStatus::Complete
    } else {
        TransferStatus::Error
    };

    on_progress(RcloneProgress {
        id: transfer_id.to_string(),
        op: op.to_string(),
        source: source.to_string(),
        destination: dest.to_string(),
        percentage: if final_status == TransferStatus::Complete { 100.0 } else { 0.0 },
        speed: String::new(),
        eta: String::new(),
        status: final_status.clone(),
    });

    if final_status == TransferStatus::Error {
        return Err(format!("rclone {} exited with non-zero status", op));
    }

    Ok(())
}

fn parse_progress(
    json: &serde_json::Value,
    transfer_id: &str,
    op: &str,
    source: &str,
    dest: &str,
) -> Option<RcloneProgress> {
    let stats = json.get("stats")?;

    let bytes_total = stats.get("totalBytes").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let bytes_transferred = stats.get("bytes").and_then(|v| v.as_f64()).unwrap_or(0.0);

    let percentage = if bytes_total > 0.0 {
        (bytes_transferred / bytes_total * 100.0) as f32
    } else {
        0.0
    };

    let speed = stats
        .get("speed")
        .and_then(|v| v.as_f64())
        .map(format_speed)
        .unwrap_or_default();

    let eta = stats
        .get("eta")
        .and_then(|v| v.as_f64())
        .map(format_eta)
        .unwrap_or_else(|| {
            stats.get("eta").and_then(|v| v.as_str()).unwrap_or("-").to_string()
        });

    Some(RcloneProgress {
        id: transfer_id.to_string(),
        op: op.to_string(),
        source: source.to_string(),
        destination: dest.to_string(),
        percentage,
        speed,
        eta,
        status: TransferStatus::Running,
    })
}

fn format_speed(bytes_per_sec: f64) -> String {
    if bytes_per_sec >= 1_073_741_824.0 {
        format!("{:.2} GiB/s", bytes_per_sec / 1_073_741_824.0)
    } else if bytes_per_sec >= 1_048_576.0 {
        format!("{:.2} MiB/s", bytes_per_sec / 1_048_576.0)
    } else if bytes_per_sec >= 1024.0 {
        format!("{:.2} KiB/s", bytes_per_sec / 1024.0)
    } else {
        format!("{:.0} B/s", bytes_per_sec)
    }
}

fn format_eta(seconds: f64) -> String {
    let s = seconds as u64;
    if s >= 3600 {
        format!("{}h {:02}m {:02}s", s / 3600, (s % 3600) / 60, s % 60)
    } else if s >= 60 {
        format!("{}m {:02}s", s / 60, s % 60)
    } else {
        format!("{}s", s)
    }
}
