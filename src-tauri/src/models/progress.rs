use serde::{Deserialize, Serialize};

/// Emitted to the frontend on each progress tick during a transfer.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RcloneProgress {
    pub id: String,
    pub op: String,
    pub source: String,
    pub destination: String,
    pub percentage: f32,
    pub speed: String,
    pub eta: String,
    pub status: TransferStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TransferStatus {
    Running,
    Complete,
    Error,
    Cancelled,
}

/// Disk usage info returned by `rclone about`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteAbout {
    pub total: Option<i64>,
    pub used: Option<i64>,
    pub free: Option<i64>,
    pub trashed: Option<i64>,
}
