"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToday } from "@/hooks/use-today";
import { SUBTEST_IDS } from "@/features/scheduling/subtest-queues";
import { sessionMinutes } from "@/features/study/study-time";
import { useStudyStore } from "@/stores/study-store";

/** Manual study-time entry. Never completes a curriculum task. */
export function StudyLogDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const logSession = useStudyStore((state) => state.logSession);
  const today = useToday();
  const [date, setDate] = useState("");
  const [start, setStart] = useState("17:00");
  const [end, setEnd] = useState("18:00");
  const [subtestId, setSubtestId] = useState("");
  const [notes, setNotes] = useState("");
  const minutes = sessionMinutes(start, end);
  const day = date || today;
  const submit = () => {
    if (logSession({ date: day, start, end, subtestId: subtestId || undefined, notes: notes.trim() || undefined })) { setNotes(""); onClose(); }
  };
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="gap-4 p-5 sm:max-w-[420px]">
        <DialogHeader><DialogTitle>Catat waktu belajar</DialogTitle></DialogHeader>
        <div className="grid gap-3 text-sm text-fg">
          <label className="grid gap-1">Tanggal<Input type="date" value={day} onChange={(e) => setDate(e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">Mulai<Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label>
            <label className="grid gap-1">Selesai<Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
          </div>
          <p className={minutes === null ? "text-xs text-danger" : "text-xs text-fg-2 tabular-nums"}>{minutes === null ? "Jam selesai harus setelah jam mulai." : `Durasi ${minutes} menit`}</p>
          <label className="grid gap-1">Subtes (opsional)
            <select value={subtestId} onChange={(e) => setSubtestId(e.target.value)} className="h-9 rounded-md border border-hairline bg-surface px-2 text-sm">
              <option value="">Tidak ditentukan</option>
              {SUBTEST_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
          </label>
          <label className="grid gap-1">Catatan (opsional)<Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        </div>
        <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Batal</Button><Button type="button" variant="brand" disabled={minutes === null} onClick={submit}>Simpan</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
