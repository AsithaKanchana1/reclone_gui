# Reclone GUI User Guide

## Overview
Reclone GUI is a Tauri + React desktop client for rclone. It lets you browse cloud remotes, run transfers (copy/sync/move), and manage remotes without the terminal.

## Prerequisites
- rclone installed and configured (`~/.config/rclone/rclone.conf`).
- Network access for your cloud providers.

## Getting Started
1) Launch the app.
2) The sidebar shows your rclone remotes. Click a remote to browse it.
3) Use the top "New Transfer" button or context menus in the file browser to start transfers.

## Connecting Remotes (No Terminal)
- Click **＋ Add / Edit** in the sidebar.
- Fill **Name** (remote nickname) and **Provider** (e.g., Google Drive, S3, Dropbox, OneDrive, WebDAV, SFTP, FTP, MEGA, Other).
- Add required keys/values (for S3: `access_key_id`, `secret_access_key`, `region`, etc.).
- Save to write into your rclone config. Use **Edit** on a card to update an existing remote.

## File Browsing (Dual-Pane)
- Left pane: source remote. Right pane: destination remote (choose in the placeholder buttons).
- Breadcrumbs are clickable to jump up the path.
- Context menu on files/folders: Copy, Move, Sync, Rename, Delete, New folder, Public link (if backend supports), Refresh.
- Drag and drop between panes to stage transfers; click **Transfer** in header to start from current path.

## Transfers and Modes
- Modes (friendly labels):
  - **Keep both** → rclone `copy` (never deletes at destination).
  - **Make identical** → rclone `sync` (deletes extras at destination; shows a warning).
  - **Move** → rclone `move` (copies then deletes source).
  - **Check** → rclone `check` (validate contents).
- Safety: **Simulation mode (dry run)** toggle runs with `--dry-run` to preview actions.
- Integrity: **Use checksums** is ON by default (`--checksum`).
- Filters: include/exclude patterns; bandwidth limit; parallel transfers/checkers.

## Progress & Notifications
- Bottom **Transfers** bar shows each job: status, percent, speed, ETA.
- Cancel running jobs; dismiss completed ones. Desktop notifications are sent on completion or failure (if OS allows).

## Public Links
- Right-click a file/folder → **Public link**. If the remote supports `rclone link`, the URL is shown and copied to clipboard.

## Rename & Delete
- Right-click → **Rename** to move within the same folder.
- **Delete** removes files; directories use `rclone purge`.

## Mounting (Planned)
- A one-click mount toggle is planned to map remotes under `~/Cloud/<RemoteName>`, with optional auto-mount on startup. (Not yet implemented.)

## Backup vs Mirror
- Backup: use **Keep both (copy)**.
- Mirror: use **Make identical (sync)** and optionally enable dry-run first to see deletions.

## Advanced Tips
- Use dry-run before sync/move to avoid accidental deletes.
- For huge folders, drag-and-drop plus **Keep both** is safest.
- Use include/exclude filters to limit scope (e.g., `*.jpg`, `!*.tmp`).

## Updating
- App updates follow GitHub releases. Ensure `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` are set in CI so the updater can verify signatures.

## Troubleshooting
- Missing remotes: run `rclone config` once, or add via **＋ Add / Edit** and refresh.
- Public link fails: the backend may not support `rclone link` or needs specific permissions.
- AppImage build on Fedora: set `APPIMAGE_EXTRACT_AND_RUN=1 NO_STRIP=true` when building.
