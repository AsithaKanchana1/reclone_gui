use crate::models::progress::RemoteAbout;
use crate::models::remote::RemoteEntry;
use crate::services::rclone_service;
use std::collections::HashMap;
use serde_json::Value;
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

#[tauri::command]
pub fn get_remote_about(remote: String) -> Result<RemoteAbout, String> {
    rclone_service::about(&remote)
}

// ──── Single-shot file operations ───────────────────────────────────

#[tauri::command]
pub fn rclone_mkdir(remote: String, path: String) -> Result<(), String> {
    rclone_service::mkdir(&remote, &path)
}

#[tauri::command]
pub fn rclone_delete(remote: String, path: String, is_dir: bool) -> Result<(), String> {
    rclone_service::delete(&remote, &path, is_dir)
}

#[tauri::command]
pub fn rclone_rename(remote: String, old_path: String, new_path: String) -> Result<(), String> {
    rclone_service::rename(&remote, &old_path, &new_path)
}

#[tauri::command]
pub fn rclone_link(remote: String, path: String) -> Result<String, String> {
    rclone_service::link(&remote, &path)
}

// ──── Config management ───────────────────────────────────────────

#[tauri::command]
pub fn rclone_config_dump() -> Result<Value, String> {
    rclone_service::config_dump()
}

#[tauri::command]
pub fn rclone_config_create(name: String, provider: String, params: HashMap<String, String>) -> Result<(), String> {
    rclone_service::config_create(&name, &provider, &params)
}

#[tauri::command]
pub fn rclone_config_update(name: String, params: HashMap<String, String>) -> Result<(), String> {
    rclone_service::config_update(&name, &params)
}

// ──── Transfer commands ─────────────────────────────────────────────

#[tauri::command]
pub async fn run_rclone_sync(
    app: AppHandle,
    source: String,
    destination: String,
    flags: Vec<String>,
) -> Result<String, String> {
    run_transfer(app, "sync", source, destination, flags).await
}

#[tauri::command]
pub async fn run_rclone_copy(
    app: AppHandle,
    source: String,
    destination: String,
    flags: Vec<String>,
) -> Result<String, String> {
    run_transfer(app, "copy", source, destination, flags).await
}

#[tauri::command]
pub async fn run_rclone_move(
    app: AppHandle,
    source: String,
    destination: String,
    flags: Vec<String>,
) -> Result<String, String> {
    run_transfer(app, "move", source, destination, flags).await
}

#[tauri::command]
pub async fn run_rclone_check(
    app: AppHandle,
    source: String,
    destination: String,
    flags: Vec<String>,
) -> Result<String, String> {
    run_transfer(app, "check", source, destination, flags).await
}

// ──── Cancel ────────────────────────────────────────────────────────

#[tauri::command]
pub fn cancel_transfer(id: String) -> Result<bool, String> {
    rclone_service::cancel_transfer(&id)
}

// ──── Shared transfer runner ────────────────────────────────────────

/// Spawns rclone in a blocking thread and emits progress events.
/// Returns the transfer ID so the frontend can track / cancel it.
async fn run_transfer(
    app: AppHandle,
    op: &str,
    source: String,
    destination: String,
    flags: Vec<String>,
) -> Result<String, String> {
    let op = op.to_string();
    let transfer_id = uuid::Uuid::new_v4().to_string();
    let tid = transfer_id.clone();

    tauri::async_runtime::spawn_blocking(move || -> Result<(), String> {
        let mut child = rclone_service::spawn_transfer(&op, &source, &destination, &flags)?;

        rclone_service::stream_progress(&mut child, &tid, &op, &source, &destination, |progress| {
            let _ = app.emit("rclone-progress", &progress);
        })?;

        Ok(())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))??;

    Ok(transfer_id)
}
