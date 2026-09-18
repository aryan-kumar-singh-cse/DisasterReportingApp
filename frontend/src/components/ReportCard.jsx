import { generateTacticalBriefing } from '../services/groqService';
import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, MapPin, Clock, Users, X, CloudRain, Zap } from 'lucide-react';
import DissonanceMeter from './DissonanceMeter';
import EvidenceChain from './EvidenceChain';
import { getDissonanceZone } from '../data/schema';

export default function ReportCard({
  report,
  onClose,
  onVote,
  onOpenChallenge,
  hasVoted,
  onOpenRadar = null,
  onOpenLightning = null
}) {
  if (!report) return null;

  const [briefing, setBriefing] = React.useState(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = React.useState(false);

  const handleGenerateBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const text = await generateTacticalBriefing(report);
      setBriefing(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const zone = getDissonanceZone(report.dissonanceScore || 0);

  const getDisasterColor = (type) => {
    switch (type) {
      case 'Fire': return 'text-red-400 bg-red-950/60 border-red-800/80';
      case 'Flood': return 'text-blue-400 bg-blue-950/60 border-blue-800/80';
      case 'Earthquake': return 'text-purple-400 bg-purple-950/60 border-purple-800/80';
      case 'Infrastructure Damage': return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      default: return 'text-zinc-400 bg-zinc-900 border-zinc-700';
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800 text-zinc-100 shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-950/90 backdrop-blur z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getDisasterColor(report.disasterType)}`}>
              {report.disasterType}
            </span>

            {report.clusterCount >= 3 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{report.clusterCount} reports corroborate</span>
              </span>
            )}

            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {report.verificationStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>{report.locationName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4 flex-1">
        {/* Visual Centerpiece: Dissonance Meter */}
        <DissonanceMeter
          score={report.dissonanceScore || 0}
          summary={report.aiSummary}
        />

        {/* Side-by-Side Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Left Column: Citizen Claim */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Citizen Claim</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(report.userSeverity)}`}>
                  {report.userSeverity} Severity
                </span>
              </div>

              {/* Photo */}
              <div className="relative rounded-lg overflow-hidden border border-zinc-800 mb-2 aspect-video bg-zinc-950">
                <img
                  src={report.photoUrl}
                  alt="Incident evidence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-zinc-300">
                  Geo-tagged
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {report.description}
              </p>
            </div>

            <div className="pt-2 mt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
              GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </div>
          </div>

          {/* Right Column: AI Evidence Assessment */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">AI-Assessed Evidence</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(report.aiSeverity)}`}>
                  AI: {report.aiSeverity}
                </span>
              </div>

              {/* Top detected visual labels */}
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] text-zinc-400 font-medium block">Prominent Visual Indicators:</span>
                <div className="flex flex-wrap gap-1">
                  {report.aiDetectedLabels && report.aiDetectedLabels.slice(0, 4).map((lbl, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-[11px] bg-zinc-800 border border-zinc-700 text-zinc-200"
                    >
                      {lbl.name} <span className="text-zinc-400 text-[10px]">{Math.round(lbl.confidence)}%</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300 mb-1">
                  <span>Verdict Status:</span>
                  <span style={{ color: zone.color }} className="font-bold font-mono">
                    {report.aiVerification}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  {report.aiVerification === 'INCONSISTENT' && 'No matching hazard signatures detected for the claimed type.'}
                  {report.aiVerification === 'CONSISTENT' && 'Direct evidence matching claimed disaster category confirmed.'}
                  {report.aiVerification === 'INCONCLUSIVE' && 'Partial or low-confidence indicators detected.'}
                </p>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
              <span>Engine: Google Gemini Multimodal Vision</span>
              <span className="text-emerald-400 font-semibold">● Active Edge</span>
            </div>
          </div>
        </div>

        {/* Evidence Chain Component */}
        <EvidenceChain report={report} />

        
        {/* Groq 120B Commander Dispatch Feature */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="text-orange-400 font-bold">⚡</span>
                <span>Groq 120B Tactical Dispatch Directive</span>
              </span>
              <span className="text-[10px] text-zinc-400">Military-grade response directives for incident commanders</span>
            </div>

            <button
              type="button"
              onClick={handleGenerateBriefing}
              disabled={isGeneratingBriefing}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
            >
              {isGeneratingBriefing ? 'Computing 120B...' : '⚡ Generate Briefing'}
            </button>
          </div>

          {briefing && (
            <div className="p-3 rounded-lg bg-black/90 border border-orange-900/60 text-xs text-orange-200 font-mono leading-relaxed whitespace-pre-wrap">
              {briefing}
            </div>
          )}
        </div>

        {/* Challenge History (Dialogue rather than verdict) */}
        {report.challengeHistory && report.challengeHistory.length > 0 && (
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/50 space-y-2">
            <span className="text-xs font-bold text-cyan-300 block">
              Citizen Challenge Dialogue History
            </span>
            {report.challengeHistory.map((ch, idx) => (
              <div key={idx} className="text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono mb-1">
                  <span>Original: {ch.aiVerification} (Score: {ch.dissonanceScore})</span>
                  <span>{new Date(ch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-zinc-200 italic mb-1">"{ch.contextNote}"</p>
                <p className="text-[11px] text-cyan-300">
                  Updated Assessment: <strong>{report.aiVerification}</strong> ({report.aiSummary})
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Live Weather Intelligence (Radar & Lightning) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenRadar && onOpenRadar(report)}
            className="py-2 px-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:bg-cyan-900/40 cursor-pointer shadow-sm"
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zone Doppler Radar</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenLightning && onOpenLightning(report)}
            className="py-2 px-3 rounded-xl bg-yellow-950/40 border border-yellow-500/40 hover:border-yellow-400 text-yellow-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:bg-yellow-900/40 cursor-pointer shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Lightning Scan</span>
          </button>
        </div>

        {/* Challenge Flow Trigger */}
        {zone.label !== 'Aligned' && onOpenChallenge && (
          <button
            type="button"
            onClick={() => onOpenChallenge(report)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-600/40 hover:border-amber-500 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-amber-600/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Challenge This Assessment (Submit 2nd Photo / Context Note)</span>
          </button>
        )}

        {/* Community Confirm / Dispute Voting */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-300 block">Community Corroboration</span>
            <span className="text-[11px] text-zinc-500">Are you near this area? Corroborate or dispute.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onVote(report.reportId, 'confirm')}
              disabled={hasVoted}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                hasVoted
                  ? 'opacity-60 cursor-not-allowed bg-zinc-800 text-zinc-400'
                  : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Confirm ({report.confirmVotes || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => onVote(report.reportId, 'dispute')}
              disabled={hasVoted}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                hasVoted
                  ? 'opacity-60 cursor-not-allowed bg-zinc-800 text-zinc-400'
                  : 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Dispute ({report.disputeVotes || 0})</span>
            </button>
          </div>
        </div>

        {/* Non-negotiable Disclaimer Footer */}
        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-center">
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
            ⚠️ <strong>AI-assisted evidence assessment</strong> — not an emergency verification authority. TwoTruths treats AI as a second witness, not a judge.
          </p>
        </div>
      </div>
    </div>
  );
}
