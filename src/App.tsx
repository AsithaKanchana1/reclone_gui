import { useState } from "react";
import type { AppView } from "@/models/types";
import { useRemotes } from "@/controllers/useRemotes";
import AppLayout from "@/views/layouts/AppLayout";
import DashboardPage from "@/views/pages/DashboardPage";
import AboutDialog from "@/views/components/AboutDialog";
import RemoteWizard from "@/views/components/RemoteWizard";

export default function App() {
  const { remotes, loading, error, refresh } = useRemotes();
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [selectedRemote, setSelectedRemote] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<"create" | "edit">("create");
  const [editRemoteName, setEditRemoteName] = useState<string | undefined>(undefined);

  const openCreate = () => { setWizardMode("create"); setEditRemoteName(undefined); setWizardOpen(true); };
  const openEdit = (name: string) => { setWizardMode("edit"); setEditRemoteName(name); setWizardOpen(true); };

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
      onOpenWizard={openCreate}
    >
      {currentView === "dashboard" && (
        <DashboardPage
          remotes={remotes}
          selectedRemote={selectedRemote}
          onSelectRemote={setSelectedRemote}
          onEditRemote={openEdit}
        />
      )}
      {currentView === "about" && <AboutDialog />}

      {wizardOpen && (
        <RemoteWizard
          mode={wizardMode}
          remoteName={editRemoteName}
          onClose={() => setWizardOpen(false)}
          onSaved={() => { refresh(); setWizardOpen(false); }}
        />
      )}
    </AppLayout>
  );
}
