"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { validateReflection } from "@/features/verification/reflection-validation";
import type { Understanding } from "@/features/curriculum/curriculum-types";
import { useStudyStore } from "@/stores/study-store";

export function StudyCheckinDialog({ open, taskId, onClose }: { open: boolean; taskId?: string; onClose: () => void }) {
  const task = useStudyStore((state) => state.tasks.find((item) => item.id === taskId));
  const completeTask = useStudyStore((state) => state.completeTask);
  const [text, setText] = useState("");
  const [understanding, setUnderstanding] = useState<Understanding>("understood");
  const error = text.length === 0 ? "Tulis refleksi minimal 100 karakter." : validateReflection(text);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="gap-5 p-5 sm:max-w-[520px]">
        <DialogHeader className="gap-1.5"><DialogTitle>{task?.title ?? "Study check-in"}</DialogTitle><p className="text-xs text-fg-2">{task ? [task.subtestIds?.join(" · "), task.subtest.split(" — ")[1], `Dijadwalkan awal ${task.originalDate}`].filter(Boolean).join(" · ") : null}</p><DialogDescription>Refleksi minimal 100 karakter sebelum materi ditandai selesai.</DialogDescription></DialogHeader>
        <div className="grid gap-4">
          <div><label htmlFor="study-reflection" className="mb-2 block text-sm font-medium text-fg">Apa yang kamu pelajari hari ini?</label><Textarea id="study-reflection" rows={6} value={text} onChange={(event) => setText(event.target.value)} placeholder="Jelaskan materi, contoh soal, kesulitan, dan hal baru yang dipahami..." /><div className="mt-1.5 flex justify-between text-xs"><span className={error ? "text-danger" : "text-fg-2"}>{error ?? "Refleksi sudah cukup panjang."}</span><span className="tabular-nums text-fg-2">{text.trim().length}/100</span></div></div>
          <fieldset><legend className="mb-2 text-sm font-medium text-fg">Pemahaman diri</legend><div className="grid gap-2 sm:grid-cols-3">{([["understood", "Saya memahami materi"], ["partial", "Sebagian memahami"], ["review", "Perlu review lagi"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setUnderstanding(value)} className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${understanding === value ? "border-brand bg-brand-tint text-fg" : "border-hairline text-fg-2 hover:bg-hover"}`}>{label}</button>)}</div></fieldset>
        </div>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Batal</Button><Button type="button" variant="brand" disabled={Boolean(error)} onClick={() => { if (taskId && completeTask(taskId, text, understanding)) { setText(""); setUnderstanding("understood"); onClose(); } }}>Selesaikan materi</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
