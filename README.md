# Reclone GUI

A modern, cross-platform graphical interface for [rclone](https://rclone.org) — browse, sync, and copy files between cloud remotes with drag-and-drop.

Built with **Tauri** (Rust) + **React** + **Tailwind CSS**.

![License](https://img.shields.io/github/license/AsithaKanchana1/reclone_gui)
![Release](https://img.shields.io/github/v/release/AsithaKanchana1/reclone_gui)
![CI](https://img.shields.io/github/actions/workflow/status/AsithaKanchana1/reclone_gui/ci.yml?label=CI)

---

## Features

- **Remote Explorer** — auto-discovers all configured rclone remotes and displays them as visual cards with service-type icons.
- **Dual File Browser** — side-by-side virtualized file lists (react-window) for source and destination remotes.
- **Drag & Drop** — drag files from one remote to another to trigger `rclone copy`. Duplicate transfers are prevented automatically.
- **Sync** — one-click `rclone sync` with real-time progress, speed, and ETA streamed from the backend.
- **Transfer Overlay** — persistent bottom bar showing live progress, speed, ETA, and a cancel button.
- **Auto-Update** — optional Tauri updater that prompts users when a new GitHub release is available.
- **Cross-Platform** — builds for Linux (AppImage, .deb) and Windows (.msi, NSIS .exe).

---

## Architecture (MVC)

```
src-tauri/src/                 # Rust Backend
├── main.rs                    # Entry point
├── commands/                  # Controllers — thin Tauri command handlers
│   ├── mod.rs
│   └── rclone_cmd.rs
├── models/                    # Models — data structures
│   ├── mod.rs
│   ├── progress.rs
│   └── remote.rs
└── services/                  # Services — core business logic
    ├── mod.rs
    └── rclone_service.rs

src/                           # React Frontend
├── models/
│   └── types.ts               # Shared TypeScript interfaces
├── services/
│   ├── rcloneApi.ts           # Tauri invoke wrappers
│   └── eventBus.ts            # Tauri event listeners
├── controllers/
│   ├── useRemotes.ts          # Remote state management
│   ├── useTransfers.ts        # Transfer progress state
│   ├── useRemoteDnD.ts        # Drag-and-drop logic
│   └── useFileBrowser.ts      # File listing + navigation
├── views/
│   ├── components/
│   │   ├── RemoteCard.tsx
│   │   ├── TransferOverlay.tsx
│   │   ├── VirtualFileList.tsx
│   │   ├── Sidebar.tsx
│   │   ├── FileBrowser.tsx
│   │   └── AboutDialog.tsx
│   ├── layouts/
│   │   └── AppLayout.tsx
│   └── pages/
│       └── DashboardPage.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## Prerequisites

| Tool    | Version  | Install                                                 |
| ------- | -------- | ------------------------------------------------------- |
| Node.js | ≥ 18     | https://nodejs.org                                      |
| Rust    | stable   | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| rclone  | ≥ 1.60   | https://rclone.org/install/                             |

### Linux additional packages (Debian/Ubuntu/Fedora)

```bash
# Debian / Ubuntu
sudo apt install libwebkit2gtk-4.0-dev libgtk-3-dev libappindicator3-dev librsvg2-dev patchelf

# Fedora
sudo dnf install webkit2gtk4.0-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel
```

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/AsithaKanchana1/reclone_gui.git
cd reclone_gui

# 2. Install frontend dependencies
npm install

# 3. Run in development mode (hot-reload frontend + Rust rebuild)
npm run tauri dev
```

The app window opens automatically. Make sure you have at least one rclone remote configured:

```bash
rclone config
```

---

## Build for Production

```bash
npm run tauri build
```

Artifacts are written to `src-tauri/target/release/bundle/`:

| Platform | Formats                      |
| -------- | ---------------------------- |
| Linux    | `.AppImage`, `.deb`          |
| Windows  | `.msi`, `.exe` (NSIS)        |

---

## Auto-Update Setup (Optional)

The app uses the **Tauri Updater** to check for new releases on GitHub.

### 1. Generate update signing keys

```bash
npx @tauri-apps/cli signer generate -w ~/.tauri/reclone_gui.key
```

This prints a **public key** and saves a **private key** to the file.

### 2. Configure the app

Edit `src-tauri/tauri.conf.json`:

```jsonc
"updater": {
  "active": true,   // ← change to true
  "pubkey": "YOUR_PUBLIC_KEY_HERE"
}
```

### 3. Add GitHub Secrets

In your repo → Settings → Secrets → Actions, add:

| Secret             | Value                              |
| ------------------ | ---------------------------------- |
| `TAURI_PUBLIC_KEY` | The public key string              |
| `TAURI_PRIVATE_KEY`| Contents of `~/.tauri/reclone_gui.key` |
| `TAURI_KEY_PASSWORD` | The password you chose (or empty) |

### 4. Create a release

```bash
git tag v0.2.0
git push origin v0.2.0
```

GitHub Actions builds the app, signs the bundles, uploads them as release assets, and generates a `latest.json` manifest. Existing users see an upgrade dialog on next launch.

---

## Releasing a New Version

1. Bump the version in `package.json` and `src-tauri/tauri.conf.json`.
2. Commit and tag:
   ```bash
   git add -A && git commit -m "release: v0.2.0"
   git tag v0.2.0
   git push origin main --tags
   ```
3. The `Release` workflow builds Linux + Windows artifacts and creates a GitHub Release automatically.

---

## Compatibility

| OS                     | Status |
| ---------------------- | ------ |
| Ubuntu 22.04+          | ✅     |
| Fedora 38+             | ✅     |
| Debian 12+             | ✅     |
| Arch Linux             | ✅ (AppImage) |
| Other Linux (glibc 2.31+) | ✅ (AppImage) |
| Windows 10             | ✅     |
| Windows 11             | ✅     |

The **AppImage** format is distribution-agnostic and runs on virtually any Linux with glibc ≥ 2.31.

---

## Credits

- [rclone](https://github.com/rclone/rclone) — command-line cloud storage manager (MIT License)
- [Tauri](https://tauri.app) — framework for lightweight desktop apps (MIT / Apache-2.0)
- [React](https://react.dev) — UI library by Meta (MIT License)
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS framework (MIT License)
- [react-window](https://github.com/bvaughn/react-window) — virtualized list rendering (MIT License)

---

## Author

**Asitha Kanchana Palliyaguru**

- [LinkedIn](https://www.linkedin.com/in/asithakanchana)
- [GitHub](https://github.com/AsithaKanchana1)

---

## License

This project is open-source under the [MIT License](LICENSE).
