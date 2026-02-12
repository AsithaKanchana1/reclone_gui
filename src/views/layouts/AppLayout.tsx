import { type ReactNode } from "react";
import type { Remote, AppView } from "@/models/types";
import Sidebar from "@/views/components/Sidebar";

type Props = {
  remotes: Remote[];
  selectedRemote: string;
  onSelectRemote: (name: string) => void;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onRefresh: () => void;
  children: ReactNode;
};

export default function AppLayout({
  remotes,
  selectedRemote,
  onSelectRemote,
  currentView,
  onChangeView,
  onRefresh,
  children,
}: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar
        remotes={remotes}
        selectedRemote={selectedRemote}
        onSelectRemote={onSelectRemote}
        currentView={currentView}
        onChangeView={onChangeView}
        onRefresh={onRefresh}
      />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
