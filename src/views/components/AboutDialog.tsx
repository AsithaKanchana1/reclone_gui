export default function AboutDialog() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold text-white">About Reclone GUI</h1>
      <p className="mt-3 text-white/70 leading-relaxed">
        <strong>Reclone GUI</strong> is a cross-platform graphical interface for{" "}
        <a
          href="https://rclone.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 underline"
        >
          rclone
        </a>
        , the powerful command-line cloud storage manager. It lets you browse, sync, and copy files
        between cloud remotes with drag-and-drop ease.
      </p>

      {/* Author */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white/90">Author</h2>
        <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-white font-semibold">Asitha Kanchana Palliyaguru</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <a
              href="https://www.linkedin.com/in/asithakanchana"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              LinkedIn →
            </a>
            <a
              href="https://github.com/AsithaKanchana1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* Credits */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white/90">Credits &amp; Acknowledgements</h2>
        <ul className="mt-3 space-y-2 text-sm text-white/70">
          <li>
            <a
              href="https://github.com/rclone/rclone"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              rclone
            </a>{" "}
            — The backbone CLI tool for managing cloud storage. MIT License.
          </li>
          <li>
            <a
              href="https://tauri.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              Tauri
            </a>{" "}
            — Framework for building lightweight desktop apps with web frontends. MIT / Apache-2.0.
          </li>
          <li>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              React
            </a>{" "}
            — UI library by Meta. MIT License.
          </li>
          <li>
            <a
              href="https://tailwindcss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              Tailwind CSS
            </a>{" "}
            — Utility-first CSS framework. MIT License.
          </li>
          <li>
            <a
              href="https://github.com/bvaughn/react-window"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              react-window
            </a>{" "}
            — Virtualized list rendering for large datasets. MIT License.
          </li>
        </ul>
      </section>

      {/* Version */}
      <section className="mt-8 text-xs text-white/40">
        Version 0.1.0 &middot; Built with ❤️ in Sri Lanka
      </section>
    </div>
  );
}
