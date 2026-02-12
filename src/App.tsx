import { useState } from "react";
import type { AppView } from "@/models/types";
import { useRemotes } from "@/controllers/useRemotes";
import AppLayout from "@/views/layouts/AppLayout";
import DashboardPage from "@/views/pages/DashboardPage";
import AboutDialog from "@/views/components/AboutDialog";

export default function App() {
  const { remotes, loading, error, refresh } = useRemotes();
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [selectedRemote, setSelectedRemote] = useState("");

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white/50">
        Loading remotes…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-950 text-white">
        <p className="text-red-400">{error}</p>
        <button
          onClick={refresh}
          className="rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AppLayout
      remotes={remotes}
      selectedRemote={selectedRemote}
      onSelectRemote={setSelectedRemote}
      currentView={currentView}
      onChangeView={setCurrentView}
      onRefresh={refresh}
    >
      {currentView === "dashboard" && (
        <DashboardPage
          remotes={remotes}
          selectedRemote={selectedRemote}
          onSelectRemote={setSelectedRemote}
        />
      )}
      {currentView === "about" && <AboutDialog />}
    </AppLayout>
  );
}
