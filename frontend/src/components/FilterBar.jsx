import React from 'react';
import { Filter, Layers, Flame, Droplets, AlertTriangle } from 'lucide-react';

export default function FilterBar({ activeFilter, onSelectFilter, activeSeverity, onSelectSeverity, count = 0 }) {
  const filters = [
    { id: 'ALL', label: 'All Reports' },
    { id: 'DIVERGENT', label: '🔴 Divergent Only (Judge Focus)' },
    { id: 'Flood', label: '🌊 Floods' },
    { id: 'Fire', label: '🔥 Fires' },
    { id: 'Infrastructure Damage', label: '🏚️ Infrastructure' }
  ];

  return (
    <div className="w-full bg-zinc-950/90 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto z-10">
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 text-xs font-mono flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>Filters:</span>
        </span>

        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelectFilter(f.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === f.id
                ? 'bg-zinc-200 text-black font-semibold shadow'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-zinc-400 font-mono whitespace-nowrap">
        Showing <span className="text-white font-bold">{count}</span> incidents
      </div>
    </div>
  );
}
