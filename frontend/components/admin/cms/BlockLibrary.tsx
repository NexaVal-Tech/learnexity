// components/admin/cms/BlockLibrary.tsx — "Add section" picker.
import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { BLOCK_CATEGORY_ORDER, blocksAddableTo } from "@/lib/cms/blocks";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

export default function BlockLibrary({
  pageSlug,
  onPick,
  onClose,
}: {
  pageSlug: string;
  onPick: (block: BlockDefinition) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const blocks = useMemo(() => blocksAddableTo(pageSlug), [pageSlug]);
  const filtered = blocks.filter((b) =>
    `${b.label} ${b.description ?? ""} ${b.category}`.toLowerCase().includes(q.toLowerCase())
  );
  const grouped = BLOCK_CATEGORY_ORDER.map((cat) => ({ cat, items: filtered.filter((b) => b.category === cat) })).filter((g) => g.items.length);

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0f0f14] rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-white/10">
          <h3 className="font-semibold text-gray-900 dark:text-white">Add a section</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="px-5 pt-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sections (e.g. hero, FAQ, logos, video)…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {grouped.length === 0 && <p className="text-sm text-gray-500 text-center py-10">No sections match “{q}”.</p>}
          {grouped.map(({ cat, items }) => (
            <div key={cat}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{cat}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {items.map((b) => (
                  <button
                    key={b.type}
                    onClick={() => onPick(b)}
                    className="text-left p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.label}</p>
                    {b.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{b.description}</p>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
