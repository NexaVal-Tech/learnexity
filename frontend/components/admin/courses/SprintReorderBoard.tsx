// components/admin/courses/SprintReorderBoard.tsx
//
// Rearrange a course's sprints and the materials inside them — drag and
// drop, or the arrow / "move to sprint" buttons. Nothing is saved until
// "Save order"; the new order is what students see on their Resources
// page and in the preview modal (sprints are renumbered 1, 2, 3…).
import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Loader2, Save, X } from "lucide-react";

export interface ReorderTopic {
  id: number;
  title: string;
  type?: string;
}
export interface ReorderSprint {
  id: number;
  number: number;
  title: string;
  topics: ReorderTopic[];
}

type Drag =
  | { kind: "sprint"; sprintIdx: number }
  | { kind: "topic"; sprintIdx: number; topicIdx: number }
  | null;

export default function SprintReorderBoard({
  sprints: initial,
  onCancel,
  onSave,
}: {
  sprints: ReorderSprint[];
  onCancel: () => void;
  onSave: (order: { id: number; items: number[] }[]) => Promise<void>;
}) {
  const [sprints, setSprints] = useState<ReorderSprint[]>(() => initial.map((s) => ({ ...s, topics: [...s.topics] })));
  const [drag, setDrag] = useState<Drag>(null);
  const [over, setOver] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = useMemo(
    () =>
      JSON.stringify(sprints.map((s) => [s.id, s.topics.map((t) => t.id)])) !==
      JSON.stringify(initial.map((s) => [s.id, s.topics.map((t) => t.id)])),
    [sprints, initial]
  );

  // ── operations ─────────────────────────────────────────────
  const moveSprint = (from: number, to: number) => {
    if (to < 0 || to >= sprints.length || from === to) return;
    setSprints((list) => {
      const next = [...list];
      const [s] = next.splice(from, 1);
      next.splice(to, 0, s);
      return next;
    });
  };

  const moveTopic = (fromSprint: number, fromIdx: number, toSprint: number, toIdx: number) => {
    setSprints((list) => {
      const next = list.map((s) => ({ ...s, topics: [...s.topics] }));
      const [t] = next[fromSprint].topics.splice(fromIdx, 1);
      if (!t) return list;
      const target = next[toSprint].topics;
      const idx = Math.max(0, Math.min(toIdx, target.length));
      target.splice(idx, 0, t);
      return next;
    });
  };

  // ── drag & drop ────────────────────────────────────────────
  const onDropSprint = (targetIdx: number) => {
    if (drag?.kind === "sprint") moveSprint(drag.sprintIdx, targetIdx);
    if (drag?.kind === "topic") moveTopic(drag.sprintIdx, drag.topicIdx, targetIdx, sprints[targetIdx].topics.length);
    setDrag(null);
    setOver(null);
  };

  const onDropTopic = (sprintIdx: number, topicIdx: number) => {
    if (drag?.kind === "topic") {
      // Dropping below itself in the same list shifts the index by one.
      const sameList = drag.sprintIdx === sprintIdx;
      const to = sameList && drag.topicIdx < topicIdx ? topicIdx - 1 : topicIdx;
      moveTopic(drag.sprintIdx, drag.topicIdx, sprintIdx, to);
    }
    setDrag(null);
    setOver(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(sprints.map((s) => ({ id: s.id, items: s.topics.map((t) => t.id) })));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Couldn't save the new order.");
      setSaving(false);
    }
  };

  const btn = "p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10">
        <p className="flex-1 text-sm text-indigo-900 dark:text-indigo-200">
          Drag sprints and materials to rearrange them, or use the arrows. Drop a material on another sprint to move it there. Sprints are renumbered in this order.
        </p>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-200 bg-white dark:bg-transparent">
          <X size={14} /> Cancel
        </button>
        <button
          onClick={save}
          disabled={!changed || saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save order
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {sprints.map((sprint, si) => (
        <div
          key={sprint.id}
          onDragOver={(e) => {
            if (!drag) return;
            e.preventDefault();
            setOver(`s${si}`);
          }}
          onDragLeave={() => setOver((o) => (o === `s${si}` ? null : o))}
          onDrop={(e) => {
            e.preventDefault();
            onDropSprint(si);
          }}
          className={`rounded-xl border overflow-hidden bg-white dark:bg-[#0f0f14] transition-colors ${
            over === `s${si}` ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-gray-200 dark:border-white/10"
          } ${drag?.kind === "sprint" && drag.sprintIdx === si ? "opacity-50" : ""}`}
        >
          <div className="p-3 flex items-center gap-3 border-b border-gray-100 dark:border-white/10">
            <span
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", `sprint-${sprint.id}`);
                setDrag({ kind: "sprint", sprintIdx: si });
              }}
              onDragEnd={() => {
                setDrag(null);
                setOver(null);
              }}
              className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical size={16} className="text-gray-400" />
            </span>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
              Sprint {si + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">{sprint.title}</span>
            <button className={btn} onClick={() => moveSprint(si, si - 1)} disabled={si === 0} aria-label="Move sprint up"><ArrowUp size={15} /></button>
            <button className={btn} onClick={() => moveSprint(si, si + 1)} disabled={si === sprints.length - 1} aria-label="Move sprint down"><ArrowDown size={15} /></button>
          </div>

          <div className="p-3 space-y-2 bg-gray-50/50 dark:bg-white/[0.02] min-h-[3rem]">
            {sprint.topics.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">No materials — drop one here.</p>
            )}
            {sprint.topics.map((topic, ti) => (
              <div
                key={topic.id}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", `topic-${topic.id}`);
                  setDrag({ kind: "topic", sprintIdx: si, topicIdx: ti });
                }}
                onDragEnd={() => {
                  setDrag(null);
                  setOver(null);
                }}
                onDragOver={(e) => {
                  if (drag?.kind !== "topic") return;
                  e.preventDefault();
                  e.stopPropagation();
                  setOver(`t${si}-${ti}`);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDropTopic(si, ti);
                }}
                className={`flex items-center gap-2 p-2.5 bg-white dark:bg-[#14141c] rounded-lg border transition-colors cursor-grab active:cursor-grabbing ${
                  over === `t${si}-${ti}` ? "border-indigo-500 border-t-2" : "border-gray-100 dark:border-white/10"
                } ${drag?.kind === "topic" && drag.sprintIdx === si && drag.topicIdx === ti ? "opacity-40" : ""}`}
              >
                <GripVertical size={14} className="text-gray-400 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{topic.title}</span>
                {sprints.length > 1 && (
                  <select
                    value={si}
                    onChange={(e) => {
                      const to = Number(e.target.value);
                      if (to !== si) moveTopic(si, ti, to, sprints[to].topics.length);
                    }}
                    className="text-xs border border-gray-200 dark:border-white/15 rounded-md bg-white dark:bg-[#0f0f14] text-gray-600 dark:text-gray-300 px-1.5 py-1"
                    aria-label="Move to sprint"
                    title="Move to sprint"
                  >
                    {sprints.map((s, idx) => (
                      <option key={s.id} value={idx}>Sprint {idx + 1}</option>
                    ))}
                  </select>
                )}
                <button className={btn} onClick={() => moveTopic(si, ti, si, ti - 1)} disabled={ti === 0} aria-label="Move up"><ArrowUp size={14} /></button>
                <button className={btn} onClick={() => moveTopic(si, ti, si, ti + 1)} disabled={ti === sprint.topics.length - 1} aria-label="Move down"><ArrowDown size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
