use serde::{Deserialize, Serialize};

/// Emitted to the frontend on each progress tick during a transfer.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RcloneProgress {
    pub op: String,
    pub source: String,
    pub destination: String,
    pub percentage: f32,
    pub speed: String,
    pub eta: String,
}
