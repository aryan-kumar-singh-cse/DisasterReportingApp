import React from 'react';
import { Flame, Radio, ChevronRight } from 'lucide-react';
import { getDissonanceZone } from '../data/schema';

export default function DisagreementFeed({ reports = [], onSelectReport, selectedReportId }) {
  // Filter for reports with notable dissonance or activity, sorted by dissonance descending
  const tickerItems = [...reports]
    .sort((a, b) => (b.dissonanceScore || 0) - (a.dissonanceScore || 0))
    .slice(0, 6);

  if (tickerItems.length === 0) return null;

  return (
    <div className="w-full bg-zinc-950/95 border-b border-zinc-800 shadow-md backdrop-blur z-20 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        {/* Ticker Lead */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-bold whitespace-nowrap animate-pulse">
          <Radio className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          <span>LIVE DISAGREEMENT TICKER</span>
        </div>

        {/* Scrolling / Carousel Strip */}
        <div className="flex-1 overflow-x-auto flex items-center gap-2 no-scrollbar scroll-smooth">
          {tickerItems.map((rep) => {
            const zone = getDissonanceZone(rep.dissonanceScore);
            const isSelected = selectedReportId === rep.reportId;

            return (
              <button
                key={rep.reportId}
                onClick={() => onSelectReport(rep)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-zinc-800 border-white shadow'
                    : 'bg-zinc-900/80 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Status Dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: zone.color,
                    boxShadow: `0 0 8px ${zone.color}aa`
                  }}
                />

                <span className="font-semibold text-zinc-200">
                  {rep.disasterType}
                </span>

                <span className="text-zinc-500 font-mono">|</span>

                <span className="text-zinc-400 truncate max-w-[200px] md:max-w-[320px]">
                  AI: {rep.aiDetectedLabels?.[0]?.name || rep.aiVerification}
                  {zone.label === 'Divergent' ? ' (Contradicts claim)' : ''}
                </span>

                <span className="text-zinc-500 font-mono">|</span>

                <span className="text-zinc-400 text-[11px] font-medium">
                  {rep.locationName.split(',')[0]}
                </span>

                <span
                  className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded font-mono ml-1"
                  style={{ backgroundColor: zone.bgColor, color: zone.color }}
                >
                  {zone.label}
                </span>

                <ChevronRight className="w-3 h-3 text-zinc-500 ml-0.5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
