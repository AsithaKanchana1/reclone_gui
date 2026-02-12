use crate::models::progress::RcloneProgress;
use crate::models::remote::RemoteEntry;
use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};

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

/// Spawn an rclone transfer process (`sync` or `copy`).
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
pub fn stream_progress<F>(child: &mut Child, op: &str, source: &str, dest: &str, mut on_progress: F) -> Result<(), String>
where
    F: FnMut(RcloneProgress),
{
    // rclone --use-json-log writes structured JSON to stderr
    let stderr = child.stderr.take().ok_or("Missing rclone stderr")?;
    let reader = BufReader::new(stderr);

    for line in reader.lines() {
        let line = line.map_err(|e| format!("Failed to read rclone output: {}", e))?;
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&line) {
            if let Some(progress) = parse_progress(&json, op, source, dest) {
                on_progress(progress);
            }
        }
    }

    let status = child.wait().map_err(|e| format!("Failed to wait for rclone: {}", e))?;
    if !status.success() {
        return Err(format!("rclone {} exited with non-zero status", op));
    }

    Ok(())
}

fn parse_progress(
    json: &serde_json::Value,
    op: &str,
    source: &str,
    dest: &str,
) -> Option<RcloneProgress> {
    // rclone stats JSON has a "stats" key with bytes, speed, eta, etc.
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
        op: op.to_string(),
        source: source.to_string(),
        destination: dest.to_string(),
        percentage,
        speed,
        eta,
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
