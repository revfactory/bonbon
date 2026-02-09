"use client";

import { useState } from "react";
import { FileText, MessageSquare, Sparkles } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { NotebookNav } from "@/components/shared/notebook-nav";
import { SourcesPanel } from "@/components/sources/sources-panel";
import { ChatPanel } from "@/components/chat/chat-panel";
import { StudioPanel } from "@/components/studio/studio-panel";
import { ShareModal } from "@/components/shared/share-modal";
import { useUpdateNotebook } from "@/hooks/use-notebooks";
import { cn } from "@/lib/utils";
import type { Notebook } from "@/lib/supabase/types";
import { toast } from "sonner";

interface NotebookClientProps {
  notebook: Notebook;
  user: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

const MOBILE_TABS = [
  { id: "sources", label: "소스", icon: FileText },
  { id: "chat", label: "채팅", icon: MessageSquare },
  { id: "studio", label: "스튜디오", icon: Sparkles },
] as const;

type MobileTab = (typeof MOBILE_TABS)[number]["id"];

export function NotebookClient({ notebook, user }: NotebookClientProps) {
  const [title, setTitle] = useState(notebook.title);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [showShareModal, setShowShareModal] = useState(false);
  const updateNotebook = useUpdateNotebook();

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle);
    try {
      await updateNotebook.mutateAsync({ id: notebook.id, title: newTitle });
    } catch {
      toast.error("제목 변경에 실패했습니다.");
      setTitle(notebook.title);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <NotebookNav
        user={user}
        notebookTitle={title}
        onTitleChange={handleTitleChange}
        onShare={handleShare}
      />

      {/* Desktop: 3-panel resizable layout */}
      <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            defaultSize="20%"
            minSize="15%"
            maxSize="30%"
            className="border-r border-border-default"
          >
            <SourcesPanel notebookId={notebook.id} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize="50%" minSize="30%">
            <ChatPanel notebookId={notebook.id} notebookTitle={title} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize="30%"
            minSize="18%"
            maxSize="35%"
            className="border-l border-border-default"
          >
            <StudioPanel notebookId={notebook.id} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: tabbed layout */}
      <div className="flex md:hidden flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === "sources" && <SourcesPanel notebookId={notebook.id} />}
          {mobileTab === "chat" && <ChatPanel notebookId={notebook.id} notebookTitle={title} />}
          {mobileTab === "studio" && <StudioPanel notebookId={notebook.id} />}
        </div>
        <nav className="flex border-t border-border-default bg-white shrink-0">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors cursor-pointer",
                  mobileTab === tab.id
                    ? "text-brand font-medium"
                    : "text-text-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        notebook={notebook}
      />
    </div>
  );
}
