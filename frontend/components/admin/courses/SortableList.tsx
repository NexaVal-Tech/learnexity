// components/admin/courses/SortableList.tsx
//
// A small re-orderable list: drag a row by its handle, or use the arrow
// buttons. Nothing is saved until "Save order". Used for the Course
// Materials list (per sprint) and External Resources (per group).
import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Loader2, Save, RotateCcw } from "lucide-react";

export interface SortableRow {
  id: number;
}

export default function SortableList<T extends SortableRow>({
  items: initial,
  renderItem,
  onSave,
  emptyText = "Nothing here yet.",
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onSave: (ids: number[]) => Promise<void>;
  emptyText?: string;
}) {
  const [items, setItems] = useState<T[]>(initial);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Reset when the source list changes (e.g. after a reload).
  const sig = initial.map((i) => i.id).join(",");
  useEffect(() => { setItems(initial); }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  const changed = useMemo(() => items.map((i) => i.id).join(",") !== sig, [items, sig]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setMsg(null);
    setItems((list) => {
      const next = [...list];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x);
      return next;
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      setMsg(null);
      await onSave(items.map((i) => i.id));
      setMsg({ ok: true, text: "Order saved — students now see it in this order." });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.response?.data?.message || "Could not save the order." });
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">{emptyText}</div>;
  }

  return (
    <div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={item.id}
            draggable
            onDragStart={(e) => { setDragIdx(idx); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => { e.preventDefault(); if (overIdx !== idx) setOverIdx(idx); }}
            onDragLeave={() => setOverIdx((o) => (o === idx ? null : o))}
            onDrop={(e) => { e.preventDefault(); if (dragIdx !== null) move(dragIdx, idx); setDragIdx(null); setOverIdx(null); }}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            className={`flex items-center gap-3 rounded-lg border bg-white dark:bg-[#14141c] px-3 py-2.5 transition ${
              overIdx === idx && dragIdx !== idx
                ? "border-[#4A3AFF] ring-2 ring-[#4A3AFF]/20"
                : "border-gray-200 dark:border-white/10"
            } ${dragIdx === idx ? "opacity-50" : ""}`}
          >
            <span className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500" title="Drag to reorder">
              <GripVertical size={16} />
            </span>
            <span className="w-6 text-xs font-semibold text-gray-400 tabular-nums">{idx + 1}</span>
            <div className="flex-1 min-w-0">{renderItem(item, idx)}</div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button type="button" onClick={() => move(idx, idx - 1)} disabled={idx === 0} aria-label="Move up"
                className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => move(idx, idx + 1)} disabled={idx === items.length - 1} aria-label="Move down"
                className="p-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30">
                <ArrowDown size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {(changed || msg) && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {changed && (
            <>
              <button type="button" onClick={save} disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#4A3AFF] text-white disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save order
              </button>
              <button type="button" onClick={() => { setItems(initial); setMsg(null); }} disabled={saving}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-200">
                <RotateCcw size={14} /> Undo
              </button>
            </>
          )}
          {msg && <span className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>}
        </div>
      )}
    </div>
  );
}
