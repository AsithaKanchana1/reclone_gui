use crate::models::remote::RemoteEntry;
use crate::services::rclone_service;
use tauri::{AppHandle, Emitter};

// ──── Query commands ────────────────────────────────────────────────

#[tauri::command]
pub fn get_rclone_remotes() -> Result<Vec<String>, String> {
    rclone_service::list_remotes()
}

#[tauri::command]
pub fn list_remote_files(remote: String, path: String) -> Result<Vec<RemoteEntry>, String> {
    rclone_service::list_files(&remote, &path)
}

// ──── Transfer commands ─────────────────────────────────────────────

#[tauri::command]
pub async fn run_rclone_sync(
    app: AppHandle,
    source: String,
    destination: String,
    flags: Vec<String>,
) -> Result<(), String> {
    run_transfer(app, "sync", source, destination, flags, "rclone-sync-progress").await
}

#[tauri::command]
pub async fn run_rclone_copy(
    app: AppHandle,
    source: String,
    destination: String,
    flags: Vec<String>,
) -> Result<(), String> {
    run_transfer(app, "copy", source, destination, flags, "rclone-copy-progress").await
}

/// Shared transfer runner — spawns rclone in a blocking thread and emits events.
async fn run_transfer(
    app: AppHandle,
    op: &str,
    source: String,
    destination: String,
    flags: Vec<String>,
    event_name: &str,
) -> Result<(), String> {
    let op = op.to_string();
    let event = event_name.to_string();

    tauri::async_runtime::spawn_blocking(move || -> Result<(), String> {
        let mut child = rclone_service::spawn_transfer(&op, &source, &destination, &flags)?;

        rclone_service::stream_progress(&mut child, &op, &source, &destination, |progress| {
            let _ = app.emit(&event, &progress);
        })?;

        Ok(())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))??;

    Ok(())
}
