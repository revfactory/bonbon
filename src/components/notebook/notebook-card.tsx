"use client";

import { useState } from "react";
import type { Notebook } from "@/lib/supabase/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const CARD_COLORS = [
  "bg-card-mint",
  "bg-card-amber",
  "bg-card-lavender",
  "bg-card-sky",
  "bg-card-emerald",
  "bg-card-rose",
];

function getCardColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

interface NotebookCardProps {
  notebook: Notebook;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export function NotebookCard({
  notebook,
  onDelete,
  onRename,
}: NotebookCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameValue, setRenameValue] = useState(notebook.title);

  const bgColor = getCardColor(notebook.id);
  const timeAgo = formatDistanceToNow(new Date(notebook.updated_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <>
      <Link
        href={`/notebook/${notebook.id}`}
        className={`${bgColor} rounded-xl h-40 p-4 flex flex-col cursor-pointer group relative hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200`}
      >
        {/* Menu */}
        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.preventDefault()}
                className="p-1 rounded-md hover:bg-black/5 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4 text-text-tertiary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setRenameValue(notebook.title);
                  setShowRenameDialog(true);
                }}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" />
                이름 변경
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
                className="cursor-pointer text-error"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Emoji */}
        <span className="text-[32px] leading-none">{notebook.emoji}</span>

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary mt-3 line-clamp-2">
          {notebook.title}
        </h3>

        <div className="flex-1" />

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{timeAgo}</span>
          <span>·</span>
          <span>소스 {notebook.source_count}개</span>
        </div>
      </Link>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>노트북 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{notebook.title}&rdquo; 노트북을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(notebook.id)}
              className="bg-error hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>노트북 이름 변경</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && renameValue.trim()) {
                onRename(notebook.id, renameValue.trim());
                setShowRenameDialog(false);
              }
            }}
            placeholder="노트북 이름"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                if (renameValue.trim()) {
                  onRename(notebook.id, renameValue.trim());
                  setShowRenameDialog(false);
                }
              }}
              className="bg-brand hover:bg-brand-hover"
            >
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
