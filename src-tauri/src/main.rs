mod commands;
mod models;
mod services;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::rclone_cmd::get_rclone_remotes,
            commands::rclone_cmd::list_remote_files,
            commands::rclone_cmd::run_rclone_sync,
            commands::rclone_cmd::run_rclone_copy,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
