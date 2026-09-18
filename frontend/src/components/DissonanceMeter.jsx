import React from 'react';
import { getDissonanceZone } from '../data/schema';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

export default function DissonanceMeter({ score = 0.5, summary = '', compact = false }) {
  const zone = getDissonanceZone(score);
  const percentage = Math.min(Math.max(Math.round(score * 100), 0), 100);

  const getIcon = () => {
    if (zone.label === 'Aligned') return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    if (zone.label === 'Partial') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <AlertCircle className="w-4 h-4 text-red-400" />;
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold flex items-center gap-1" style={{ color: zone.color }}>
            {getIcon()}
            <span>{zone.label} ({percentage}%)</span>
          </span>
          <span className="text-zinc-400 text-[10px]">Dissonance</span>
        </div>
        <div className="relative h-2 w-full rounded-full overflow-hidden bg-zinc-800 flex">
          <div className="w-[30%] bg-emerald-500/50"></div>
          <div className="w-[40%] bg-amber-500/50"></div>
          <div className="w-[30%] bg-red-500/50"></div>
          <div
            className="absolute top-0 bottom-0 w-2 -ml-1 rounded-full bg-white shadow-lg transition-all duration-300"
            style={{ left: `${percentage}%`, backgroundColor: zone.color }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: zone.bgColor, border: `1px solid ${zone.color}40` }}>
            {getIcon()}
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">Claim vs Evidence Dissonance</span>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span style={{ color: zone.color }}>{zone.label.toUpperCase()}</span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-zinc-300 text-xs font-mono">Score: {score.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-mono tracking-tight" style={{ color: zone.color }}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Horizontal Bar with 3 segments */}
      <div className="relative my-3 pt-1">
        <div className="relative h-3.5 w-full rounded-full overflow-hidden bg-zinc-800 flex shadow-inner border border-zinc-700/50">
          <div className="w-[30%] bg-emerald-500/30 border-r border-emerald-500/30 flex items-center justify-center">
            <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-tighter opacity-80">Aligned</span>
          </div>
          <div className="w-[40%] bg-amber-500/30 border-r border-amber-500/30 flex items-center justify-center">
            <span className="text-[9px] font-bold text-amber-300 uppercase tracking-tighter opacity-80">Partial</span>
          </div>
          <div className="w-[30%] bg-red-500/30 flex items-center justify-center">
            <span className="text-[9px] font-bold text-red-300 uppercase tracking-tighter opacity-80">Divergent</span>
          </div>
        </div>

        {/* Needle Indicator */}
        <div
          className="absolute -top-1 transition-all duration-500 ease-out z-10"
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        >
          <div
            className="w-4 h-6 flex flex-col items-center justify-between filter drop-shadow-md"
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white shadow" style={{ backgroundColor: zone.color }} />
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px]" style={{ borderTopColor: zone.color }} />
          </div>
        </div>
      </div>

      {/* Zone Legend */}
      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono pt-1 px-1">
        <span>0.0 (Corroborated)</span>
        <span>0.5 (Inconclusive)</span>
        <span>1.0 (Contradictory)</span>
      </div>

      {/* Human-readable AI summary */}
      {summary && (
        <div className="mt-3 pt-3 border-t border-zinc-800/80">
          <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
            "{summary}"
          </p>
        </div>
      )}
    </div>
  );
}
