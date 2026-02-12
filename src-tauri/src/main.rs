mod commands;
mod models;
mod services;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::rclone_cmd::get_rclone_remotes,
            commands::rclone_cmd::list_remote_files,
            commands::rclone_cmd::get_remote_about,
            commands::rclone_cmd::rclone_mkdir,
            commands::rclone_cmd::rclone_delete,
            commands::rclone_cmd::rclone_rename,
            commands::rclone_cmd::rclone_link,
            commands::rclone_cmd::run_rclone_sync,
            commands::rclone_cmd::run_rclone_copy,
            commands::rclone_cmd::run_rclone_move,
            commands::rclone_cmd::run_rclone_check,
            commands::rclone_cmd::cancel_transfer,
            commands::rclone_cmd::rclone_config_dump,
            commands::rclone_cmd::rclone_config_create,
            commands::rclone_cmd::rclone_config_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
