use serde::{Deserialize, Serialize};

/// A single entry returned by `rclone lsjson`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct RemoteEntry {
    pub path: String,
    pub name: String,
    pub size: i64,
    pub mime_type: Option<String>,
    pub mod_time: Option<String>,
    pub is_dir: bool,
}
