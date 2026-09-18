import React, { useState, useEffect } from 'react';
import { Shield, Plus, Map, ListOrdered, Radio, CloudRain, Zap, Globe, Bot } from 'lucide-react';
import { INITIAL_MOCK_REPORTS } from './data/mockReports';
import { api } from './services/api';
import DisagreementFeed from './components/DisagreementFeed';
import ReportMap from './components/ReportMap';
import ReportCard from './components/ReportCard';
import ResponderTriageView from './components/ResponderTriageView';
import ReportFormModal from './components/ReportFormModal';
import ChallengeModal from './components/ChallengeModal';
import FilterBar from './components/FilterBar';
import WeatherRadarModal from './components/WeatherRadarModal';
import LightningTrackerModal from './components/LightningTrackerModal';
import LocationSearchBar from './components/LocationSearchBar';
import DisasterGlobeView from './components/DisasterGlobeView';
import CrisisChatModal from './components/CrisisChatModal';

class SafeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn("UI boundary caught error:", error, info);
    if (this.props.onError) this.props.onError();
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default function App() {
  const [reports, setReports] = useState(INITIAL_MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState(INITIAL_MOCK_REPORTS[0]);
  const [viewMode, setViewMode] = useState('globe'); // 'globe' (default 3D Earth) | 'citizen' (2D Map) | 'responder' (Triage)
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [challengeReport, setChallengeReport] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isLightningModalOpen, setIsLightningModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState(null);
  const [userGPS, setUserGPS] = useState(null);
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [weatherTarget, setWeatherTarget] = useState(null);

  const handleDirectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const gpsObj = { lat: latitude, lng: longitude, accuracy, zoom: 15 };
        setUserGPS(gpsObj);
        setIsGpsLocating(false);
      },
      (err) => {
        setIsGpsLocating(false);
        alert("Could not access your GPS location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleOpenRadar = (rep = null) => {
    setWeatherTarget(rep || selectedReport || reports[0]);
    setIsRadarModalOpen(true);
  };

  const handleOpenLightning = (rep = null) => {
    setWeatherTarget(rep || selectedReport || reports[0]);
    setIsLightningModalOpen(true);
  };

  // Sync with remote API if reachable
  useEffect(() => {
    async function loadReports() {
      const remote = await api.getReports();
      if (remote && remote.length > 0) {
        setReports(remote);
        setSelectedReport(remote[0]);
      }
    }
    loadReports();
  }, []);

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (activeFilter === 'DIVERGENT') return (r.dissonanceScore || 0) >= 0.7;
    if (activeFilter !== 'ALL') return r.disasterType === activeFilter;
    return true;
  });

  // Handle voting
  const handleVote = (reportId, type) => {
    if (userVotes[reportId]) return;

    setUserVotes((prev) => ({ ...prev, [reportId]: type }));
    setReports((prev) =>
      prev.map((r) => {
        if (r.reportId === reportId) {
          const confirms = type === 'confirm' ? (r.confirmVotes || 0) + 1 : r.confirmVotes || 0;
          const disputes = type === 'dispute' ? (r.disputeVotes || 0) + 1 : r.disputeVotes || 0;
          let verificationStatus = r.verificationStatus;
          if (disputes >= 3 && disputes >= confirms) verificationStatus = 'DISPUTED';
          else if (confirms >= 3 && confirms > disputes * 2) verificationStatus = 'COMMUNITY_CONFIRMED';

          const updated = {
            ...r,
            confirmVotes: confirms,
            disputeVotes: disputes,
            verificationStatus
          };
          if (selectedReport?.reportId === reportId) setSelectedReport(updated);
          return updated;
        }
        return r;
      })
    );
  };

  // Handle new report submission
  const handleCreateReport = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
  };

  // Handle challenge resolution
  const handleChallengeResolved = (updatedReport) => {
    setReports((prev) =>
      prev.map((r) => (r.reportId === updatedReport.reportId ? updatedReport : r))
    );
    setSelectedReport(updatedReport);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* Top Main Navigation Bar */}
      <header className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-600/30">
            <span className="font-black text-white text-base font-mono">RQ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-heading">Only ResQ</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-400">
                Crisis Intelligence
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Live Disaster Telemetry, Weather Radar & Dissonance Intelligence
            </p>
          </div>
        </div>

        {/* WeatherGPT Style Live Location Search Bar */}
        <div className="w-44 sm:w-60 md:w-72 lg:w-80 shrink-0">
          <LocationSearchBar
            onSelectLocation={(loc) => {
              setSearchLocation(loc);
              if (viewMode === 'responder') setViewMode('globe');
            }}
            onUseCurrentLocation={handleDirectGPS}
            isLocating={isGpsLocating}
          />
        </div>

        {/* Center View Toggle: 3D Globe ⇄ 2D Map ⇄ Responder Triage */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewMode('globe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'globe'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline">3D Globe</span>
            <span className="md:hidden">Globe</span>
          </button>
          <button
            onClick={() => setViewMode('citizen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'citizen'
                ? 'bg-zinc-800 text-white shadow font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden md:inline">2D Map</span>
            <span className="md:hidden">Map</span>
          </button>
          <button
            onClick={() => setViewMode('responder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'responder'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Triage</span>
            <span className="md:hidden">Triage</span>
          </button>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          {/* ResQ Crisis GPT Agent */}
          <button
            onClick={() => setIsChatModalOpen(true)}
            title="Chat with ResQ Crisis AI (Groq 120B / Gemini)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-200 border border-cyan-500/40 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Crisis GPT</span>
          </button>

          <button
            onClick={() => handleOpenRadar()}
            title="Interactive Live Weather Radar & Synoptic Map (Precipitation, Wind, Heatmap)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Live Radar</span>
          </button>

          <button
            onClick={() => handleOpenLightning()}
            title="IITM / IMD DAMINI Lightning & Convective Risk Analyzer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-950/60 hover:bg-yellow-900/60 text-yellow-300 border border-yellow-500/40 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 animate-pulse" />
            <span className="hidden sm:inline">Live Lightning</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Report Disaster</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>
      </header>

      {/* Hero Disagreement Ticker */}
      <DisagreementFeed
        reports={reports}
        onSelectReport={(rep) => {
          setSelectedReport(rep);
          if (viewMode !== 'citizen') setViewMode('citizen');
        }}
        selectedReportId={selectedReport?.reportId}
      />

      {/* Main Content Area: 3D Globe (Default) ⇄ 2D Map ⇄ Responder Triage */}
      {viewMode === 'globe' ? (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
          {/* Interactive 3D Earth Planetary Disaster Globe (WeatherGPT Hero Style) */}
          <div className="flex-1 h-full min-h-[340px] relative">
            <SafeErrorBoundary
              onError={() => setViewMode('citizen')}
              fallback={
                <ReportMap
                  reports={filteredReports}
                  selectedReport={selectedReport}
                  onSelectReport={setSelectedReport}
                  onOpenRadar={handleOpenRadar}
                  onOpenLightning={handleOpenLightning}
                  onOpenGlobe={() => setViewMode('globe')}
                  searchLocation={searchLocation}
                  userGPS={userGPS}
                  onUserLocationFound={setUserGPS}
                />
              }
            >
              <DisasterGlobeView
                reports={filteredReports}
                selectedReport={selectedReport}
                onSelectReport={setSelectedReport}
                onOpenRadar={handleOpenRadar}
                onOpenLightning={handleOpenLightning}
                onOpenChat={() => setIsChatModalOpen(true)}
                userGPS={userGPS}
                onUserLocationFound={setUserGPS}
              />
            </SafeErrorBoundary>
          </div>

          {/* Right Slide Bar Drawer (Assessment, Live Field Activity, Verified News) */}
          {selectedReport && (
            <div className="w-full md:w-[480px] lg:w-[520px] h-[52vh] md:h-full z-20 flex-shrink-0 shadow-2xl">
              <ReportCard
                report={selectedReport}
                allReports={filteredReports}
                onSelectReport={setSelectedReport}
                onClose={() => setSelectedReport(null)}
                onVote={handleVote}
                onOpenChallenge={(rep) => setChallengeReport(rep)}
                hasVoted={!!userVotes[selectedReport.reportId]}
                onOpenRadar={handleOpenRadar}
                onOpenLightning={handleOpenLightning}
                onOpenChat={() => setIsChatModalOpen(true)}
              />
            </div>
          )}
        </div>
      ) : viewMode === 'citizen' ? (
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Quick Filters */}
          <FilterBar
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            count={filteredReports.length}
          />

          {/* Map + Side Drawer Split */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
            {/* Interactive Leaflet Map (Satellite Aerial & Streets) */}
            <div className="flex-1 h-full min-h-[300px] relative">
              <ReportMap
                reports={filteredReports}
                selectedReport={selectedReport}
                onSelectReport={setSelectedReport}
                onOpenRadar={handleOpenRadar}
                onOpenLightning={handleOpenLightning}
                onOpenGlobe={() => setViewMode('globe')}
                searchLocation={searchLocation}
                userGPS={userGPS}
                onUserLocationFound={setUserGPS}
              />
            </div>

            {/* Selected Report Card Drawer */}
            {selectedReport && (
              <div className="w-full md:w-[480px] lg:w-[520px] h-[52vh] md:h-full z-20 flex-shrink-0 shadow-2xl">
                <ReportCard
                  report={selectedReport}
                  allReports={filteredReports}
                  onSelectReport={setSelectedReport}
                  onClose={() => setSelectedReport(null)}
                  onVote={handleVote}
                  onOpenChallenge={(rep) => setChallengeReport(rep)}
                  hasVoted={!!userVotes[selectedReport.reportId]}
                  onOpenRadar={handleOpenRadar}
                  onOpenLightning={handleOpenLightning}
                  onOpenChat={() => setIsChatModalOpen(true)}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Responder Triage View */
        <ResponderTriageView
          reports={filteredReports}
          onSelectReport={(rep) => {
            setSelectedReport(rep);
            setViewMode('globe');
          }}
        />
      )}

      {/* Modals */}
      <ReportFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleCreateReport}
      />

      <ChallengeModal
        report={challengeReport}
        isOpen={!!challengeReport}
        onClose={() => setChallengeReport(null)}
        onSubmitChallenge={handleChallengeResolved}
      />

      {/* WeatherGPT Live Weather Radar Modal (Precipitation, Wind, Heatmap) */}
      <WeatherRadarModal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        city={weatherTarget?.locationName || selectedReport?.locationName || 'Incident Sector'}
        lat={weatherTarget?.latitude ?? selectedReport?.latitude ?? 19.0760}
        lng={weatherTarget?.longitude ?? selectedReport?.longitude ?? 72.8777}
      />

      {/* DAMINI Convective & Lightning Risk Modal */}
      <LightningTrackerModal
        isOpen={isLightningModalOpen}
        onClose={() => setIsLightningModalOpen(false)}
        city={weatherTarget?.locationName || selectedReport?.locationName || 'Incident Sector'}
        lat={weatherTarget?.latitude ?? selectedReport?.latitude ?? 19.0760}
        lng={weatherTarget?.longitude ?? selectedReport?.longitude ?? 72.8777}
        condition={
          (weatherTarget || selectedReport)?.disasterType === 'FLOOD'
            ? 'Severe Monsoonal Squall & Flood Surge'
            : (weatherTarget || selectedReport)?.disasterType === 'FIRE'
            ? 'Dry High-Wind Convective Heat Front'
            : 'Unstable Atmospheric Storm Front'
        }
      />

      {/* ResQ Crisis GPT Agent Modal (Powered by Groq 120B / Gemini) */}
      <CrisisChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        currentLocation={weatherTarget?.locationName || selectedReport?.locationName || 'Incident Sector'}
        selectedReport={selectedReport}
      />
    </div>
  );
}
