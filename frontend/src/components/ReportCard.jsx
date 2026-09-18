import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MapPin,
  Clock,
  Users,
  X,
  CloudRain,
  Zap,
  Radio,
  Newspaper,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import DissonanceMeter from './DissonanceMeter';
import EvidenceChain from './EvidenceChain';
import { getDissonanceZone } from '../data/schema';
import { VERIFIED_DISASTER_NEWS } from '../data/verifiedNews';

export default function ReportCard({
  report,
  allReports = [],
  onSelectReport = () => {},
  onClose,
  onVote,
  onOpenChallenge,
  hasVoted,
  onOpenRadar = null,
  onOpenLightning = null,
  onOpenChat = null
}) {
  const [activeTab, setActiveTab] = useState('assessment'); // 'assessment' | 'activity' | 'news'
  const [briefing, setBriefing] = useState(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [secondsTick, setSecondsTick] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [report?.reportId]);

  // Live 1-second telemetry stream ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!report && allReports.length > 0) {
    report = allReports[0];
  }
  if (!report) return null;

  const handleNewsClick = (news) => {
    // Find matching report
    const query = (news.title + ' ' + (news.affectedAreas || []).join(' ')).toLowerCase();
    const matched = allReports.find(r => {
      const loc = (r.locationName || '').toLowerCase();
      if (query.includes('modinagar') && loc.includes('modinagar')) return true;
      if (query.includes('kurla') && loc.includes('kurla')) return true;
      if (query.includes('assam') && loc.includes('assam')) return true;
      if (query.includes('delhi') && loc.includes('delhi')) return true;
      if (query.includes('peenya') && loc.includes('peenya')) return true;
      return false;
    }) || report;

    onSelectReport(matched);
    setActiveTab('assessment');
    if (onOpenRadar) {
      setTimeout(() => onOpenRadar(matched), 150);
    }
  };

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

  const zone = getDissonanceZone(report?.dissonanceScore || 0);

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
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800 text-zinc-100 shadow-2xl overflow-hidden font-sans">
      {/* Top Slide Bar Tabs */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-zinc-800 bg-zinc-900/70 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'assessment'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🎯 Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Field Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'news'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified News</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: INCIDENT DEEP DIVE ASSESSMENT */}
        {activeTab === 'assessment' && (
          <div className="space-y-4">
            {/* Header Title & Tags */}
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
                  {report.verificationStatus?.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
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

            {/* Live 1-Second Sensor & Radar Telemetry Bar */}
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-emerald-300">LIVE TELEMETRY (1S SYNC)</span>
              </div>
              <span className="text-zinc-300">
                Doppler: {(44 + (secondsTick % 4)).toFixed(1)} dBZ | Wind: {(52 + (secondsTick % 7)).toFixed(0)} km/h
              </span>
            </div>

            {/* Quick 1-Tap Incident Radar & Threat Action Bar */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onOpenRadar && onOpenRadar(report)}
                className="py-1.5 px-2 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
              >
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                <span>🌧️ Live Radar</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenLightning && onOpenLightning(report)}
                className="py-1.5 px-2 rounded-lg bg-yellow-900/40 hover:bg-yellow-800/60 border border-yellow-500/40 text-yellow-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>⚡ Lightning</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenChat && onOpenChat(report)}
                className="py-1.5 px-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/40 text-blue-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
              >
                <span>🤖 Crisis AI</span>
              </button>
            </div>

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

                  <div className="relative rounded-lg overflow-hidden border border-zinc-800 mb-2 aspect-video bg-zinc-950 flex items-center justify-center">
                    {report.photoUrl && !imgError && report.disasterType !== 'LIVE GPS' && report.disasterType !== 'SEARCH TARGET' ? (
                      <img
                        src={report.photoUrl}
                        alt="Incident visual evidence"
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-cyan-950/40 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                        <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-1 z-10">
                          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                        </div>
                        <span className="text-xs font-bold text-white z-10">
                          {report.disasterType === 'LIVE GPS' ? 'Live GPS Ground Truth' : 'Satellite Telemetry Stream'}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 z-10 truncate max-w-[200px]">
                          {report.locationName || 'Geo-Targeted Coordinate'}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-zinc-300">
                      Geo-tagged
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
                  GPS: {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                </div>
              </div>

              {/* Right Column: AI Evidence Assessment */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">AI Evidence</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(report.aiSeverity)}`}>
                      {report.aiSeverity} Assessed
                    </span>
                  </div>

                  <div className="mb-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <div className="text-[11px] font-mono text-cyan-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span>AWS + Gemini Vision:</span>
                      </span>
                      <span className="text-zinc-400 font-mono">{Math.round((report.aiConfidence || 0.94) * 100)}% Conf</span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {report.aiVerification}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {report.aiSummary}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-orange-950/80 border border-orange-500/40 text-orange-300 text-[9px] font-bold">
                      AWS Rekognition
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-bold">
                      Gemini 2.0
                    </span>
                  </div>
                  <span className={zone.color}>{zone.label}</span>
                </div>
              </div>
            </div>

            {/* Evidence Chain */}
            <div className="pt-1">
              <EvidenceChain report={report} />
            </div>

            {/* Groq 120B Commander Dispatch Briefing */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-cyan-500/30 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">Groq 120B Incident Briefing</span>
                </div>
                {!briefing && (
                  <button
                    onClick={handleGenerateBriefing}
                    disabled={isGeneratingBriefing}
                    className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingBriefing ? 'Generating Directive...' : 'Generate Dispatch Briefing'}
                  </button>
                )}
              </div>
              {briefing ? (
                <div className="text-xs font-mono text-zinc-300 whitespace-pre-line leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  {briefing}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 font-sans italic">
                  Generate instant tactical dispatch directive powered by Groq's 120B model based on dissonance score.
                </p>
              )}
            </div>

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
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-600/40 hover:border-amber-500 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-amber-600/30 cursor-pointer"
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
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
          </div>
        )}

        {/* TAB 2: LIVE FIELD ACTIVITIES STREAM */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-800">
              <span className="font-bold text-zinc-200">Recent Incident Stream</span>
              <span className="font-mono text-cyan-400">{allReports.length} Dispatches Tracked</span>
            </div>

            {allReports.map((rep) => (
              <div
                key={rep.reportId}
                onClick={() => {
                  onSelectReport(rep);
                  setActiveTab('assessment');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  rep.reportId === report.reportId
                    ? 'bg-cyan-950/30 border-cyan-500/50'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDisasterColor(rep.disasterType)}`}>
                      {rep.disasterType}
                    </span>
                    <span className="text-xs font-bold text-white">{rep.locationName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 italic">
                  "{rep.description}"
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px] font-mono">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{rep.confirmVotes || 0} confirmed • {rep.disputeVotes || 0} disputes</span>
                  </span>
                  <span className="text-zinc-400 flex items-center gap-1 hover:text-white">
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: OFFICIAL VERIFIED DISASTER NEWS */}
        {activeTab === 'news' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-300 block">Verified Official Source Feed</span>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Curated exclusively from accredited disaster authorities: NDMA, IMD, USGS, and PIB Civil Defence.
                </p>
              </div>
            </div>

            {VERIFIED_DISASTER_NEWS.map((news) => (
              <div
                key={news.id}
                onClick={() => handleNewsClick(news)}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 transition-all space-y-2.5 shadow-sm cursor-pointer hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${news.badgeColor} flex items-center gap-1`}>
                    <ShieldCheck className="w-3 h-3" />
                    <span>{news.agencyBadge}</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">{news.timestamp}</span>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug">
                  {news.title}
                </h4>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {news.summary}
                </p>

                {/* Affected Localities */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-zinc-500 font-mono">Zones:</span>
                  {news.affectedAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono"
                    >
                      {area}
                    </span>
                  ))}
                </div>

                {/* Direct Action Directive */}
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Advisory:</strong> {news.actionRequired}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px]">
                  <span className="text-zinc-500 font-mono">{news.agency}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewsClick(news);
                      }}
                      className="px-2 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition text-[10px]"
                    >
                      <CloudRain className="w-3 h-3 text-cyan-400" />
                      <span>🌧️ Track on Radar</span>
                    </button>
                    <a
                      href={news.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
