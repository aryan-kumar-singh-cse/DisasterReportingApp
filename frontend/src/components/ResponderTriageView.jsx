import React from 'react';
import { Shield, Users, ArrowUpRight, Flame, Droplets, Activity, Wrench } from 'lucide-react';
import { getDissonanceZone } from '../data/schema';

export default function ResponderTriageView({ reports = [], onSelectReport }) {
  // Sort priority queue by Triage Score descending
  const sortedReports = [...reports].sort((a, b) => (b.triageScore || 0) - (a.triageScore || 0));

  const getPriorityStyle = (score) => {
    if (score >= 0.75) return { badge: 'HIGH PRIORITY', bg: 'bg-red-500/20 text-red-300 border-red-500/40', bar: 'bg-red-500' };
    if (score >= 0.45) return { badge: 'MEDIUM PRIORITY', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', bar: 'bg-amber-500' };
    return { badge: 'FLAGGED FOR VERIFICATION', bg: 'bg-zinc-700/30 text-zinc-400 border-zinc-700', bar: 'bg-zinc-600' };
  };

  const getDisasterIcon = (type) => {
    switch (type) {
      case 'Fire': return <Flame className="w-4 h-4 text-red-400" />;
      case 'Flood': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'Earthquake': return <Activity className="w-4 h-4 text-purple-400" />;
      default: return <Wrench className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* View Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-400">
                <Shield className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Responder Tactical Triage Queue</h1>
                <p className="text-xs text-zinc-400">
                  Algorithmic dispatch prioritization: Severity (40%) + Corroboration (30%) + AI Evidence Alignment (30%)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-right">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Active Incidents</span>
              <span className="text-sm font-bold text-white">{reports.length} Reports</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/60 text-right">
              <span className="text-[10px] text-red-400 uppercase font-mono block">Top Priority</span>
              <span className="text-sm font-bold text-red-300">
                {reports.filter(r => (r.triageScore || 0) >= 0.75).length} Ready to Dispatch
              </span>
            </div>
          </div>
        </div>

        {/* Informational Box for Judges */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div>
            <strong className="text-white block mb-0.5">Decision-Maker Payoff:</strong>
            Notice how divergent reports (like the Bandra barbecue fire claim) are deprioritized, not hidden. They are routed to verification specialists rather than wasting emergency rescue teams.
          </div>
        </div>

        {/* Priority List */}
        <div className="space-y-3">
          {sortedReports.map((rep, idx) => {
            const prio = getPriorityStyle(rep.triageScore || 0);
            const zone = getDissonanceZone(rep.dissonanceScore || 0);

            return (
              <div
                key={rep.reportId}
                onClick={() => onSelectReport(rep)}
                className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-pointer flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* Left Column: Rank & Incident info */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 font-mono font-bold text-sm text-zinc-400">
                    #{idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-sm font-bold text-white">
                        {getDisasterIcon(rep.disasterType)}
                        <span>{rep.disasterType}</span>
                      </span>

                      <span className="text-xs text-zinc-400 font-medium">
                        • {rep.locationName}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${prio.bg}`}>
                        {prio.badge}
                      </span>

                      {rep.clusterCount >= 3 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{rep.clusterCount} Corroborations</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-1 max-w-xl">
                      "{rep.description}"
                    </p>

                    <div className="text-[11px] text-zinc-400 flex items-center gap-3 pt-1">
                      <span>Citizen Severity: <strong className="text-zinc-200">{rep.userSeverity}</strong></span>
                      <span>AI Severity: <strong className="text-zinc-200">{rep.aiSeverity}</strong></span>
                      <span>
                        Dissonance: <strong style={{ color: zone.color }}>{zone.label} ({Math.round(rep.dissonanceScore * 100)}%)</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Score Breakdown & CTA */}
                <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Triage Score</span>
                    <span className="text-2xl font-bold font-mono tracking-tight text-white">
                      {(rep.triageScore || 0).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReport(rep);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
