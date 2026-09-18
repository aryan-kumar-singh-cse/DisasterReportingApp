import React, { useState, useEffect, useMemo } from 'react';
import ReportMap from './components/ReportMap';
import FilterBar from './components/FilterBar';
import ReportCard from './components/ReportCard';
import ReportModal from './components/ReportModal';
import { fetchReports, submitReport, castVote, getUploadUrl } from './services/api';
import { uploadIncidentPhoto } from './services/uploadService';
import { ShieldAlert, Plus, MapPin, Eye, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Detecting location...');

  // Filters and sorting state
  const [filters, setFilters] = useState({
    disasterType: 'All',
    severity: 'All',
    aiStatus: 'All'
  });
  const [sortBy, setSortBy] = useState('newest');

  // Auto-detect user's live GPS location on app load
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          setLocationStatus(`Live GPS: ${loc[0].toFixed(4)}, ${loc[1].toFixed(4)}`);
        },
        (err) => {
          console.warn('GPS detection failed:', err.message);
          setLocationStatus('GPS unavailable — showing default region');
          // Fallback to a reasonable default
          setUserLocation([19.0760, 72.8777]);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('Geolocation not supported');
      setUserLocation([19.0760, 72.8777]);
    }
  }, []);

  // Load initial reports
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchReports();
        setReports(data || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle new report submission
  const handleReportSubmit = async (formData) => {
    try {
      // 1. Upload photo (direct to S3 if presigned URL available, or local object URL)
      const { s3Key, photoUrl } = await uploadIncidentPhoto(formData.photoFile, getUploadUrl);

      // 2. Submit report metadata
      const newReport = await submitReport({
        disasterType: formData.disasterType,
        userSeverity: formData.userSeverity,
        description: formData.description,
        photoKey: s3Key,
        photoUrl,
        latitude: formData.latitude,
        longitude: formData.longitude,
        locationName: 'Reported Location'
      });

      // 3. Update local state and select new report
      setReports((prev) => [newReport, ...prev]);
      setSelectedReportId(newReport.reportId);
      showNotification('Report submitted successfully with AI evidence assessment!', 'success');
    } catch (err) {
      console.error('Submission failed:', err);
      showNotification('Submission error: ' + err.message, 'error');
      throw err;
    }
  };

  // Handle community voting
  const handleVote = async (reportId, voteType) => {
    try {
      const updated = await castVote(reportId, voteType);
      if (updated) {
        setReports((prev) => prev.map((r) => (r.reportId === reportId ? updated : r)));
      }
      showNotification(`Your ${voteType.toLowerCase()} vote was recorded!`, 'success');
    } catch (err) {
      console.error('Voting failed:', err);
    }
  };

  // Helper: calculate distance between two lat/lng points (km)
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (filters.disasterType !== 'All' && r.disasterType !== filters.disasterType) return false;
        if (filters.severity !== 'All' && r.userSeverity !== filters.severity) return false;
        if (filters.aiStatus !== 'All' && r.aiVerification !== filters.aiStatus) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          const weights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return (weights[b.userSeverity] || 0) - (weights[a.userSeverity] || 0);
        }
        if (sortBy === 'distance' && userLocation) {
          const distA = getDistanceKm(userLocation[0], userLocation[1], a.latitude, a.longitude);
          const distB = getDistanceKm(userLocation[0], userLocation[1], b.latitude, b.longitude);
          return distA - distB;
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [reports, filters, sortBy, userLocation]);

  const selectedReport = reports.find((r) => r.reportId === selectedReportId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <header style={{
        height: '60px',
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={26} color="#ef4444" />
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>
            ResQ <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#94a3b8' }}>· Live Incident Intelligence</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            fontSize: '13px',
            backgroundColor: '#0f172a',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid #334155',
            color: '#e2e8f0'
          }}>
            Active Incidents: <strong>{filteredReports.length}</strong> / {reports.length}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
          >
            <Plus size={16} />
            <span>+ Report Incident</span>
          </button>
        </div>
      </header>

      {/* Filter and Sort Toolbar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        incidentCount={filteredReports.length}
      />

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          zIndex: 3000,
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Main Split-Screen Workspace */}
      <main style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Interactive Leaflet Map */}
        <div style={{ flex: 1, height: '100%' }}>
          <ReportMap
            reports={filteredReports}
            selectedReportId={selectedReportId}
            onSelectReport={(report) => setSelectedReportId(report.reportId)}
            center={userLocation || [19.0760, 72.8777]}
          />
        </div>

        {/* Side Drawer: Selected Report Inspection or Incident Feed */}
        <aside style={{
          width: '420px',
          backgroundColor: '#1e293b',
          borderLeft: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '16px',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.5)'
        }}>
          {selectedReport ? (
            <ReportCard
              report={selectedReport}
              onVote={handleVote}
              onClose={() => setSelectedReportId(null)}
            />
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                  Active Disaster Feed ({filteredReports.length})
                </h2>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Select to view AI assessment</span>
              </div>

              {filteredReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <p>No reports match your active filters.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredReports.map((report) => (
                    <div
                      key={report.reportId}
                      onClick={() => setSelectedReportId(report.reportId)}
                      style={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#f8fafc' }}>
                          {report.disasterType === 'Flood' ? '🌊' : (report.disasterType === 'Fire' ? '🔥' : '⚠️')} {report.disasterType}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: report.userSeverity === 'Critical' ? '#ef4444' : '#f97316',
                          color: '#fff',
                          fontWeight: 600
                        }}>
                          {report.userSeverity}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        margin: '0 0 8px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {report.description || 'No description provided.'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                        <span style={{
                          color: report.aiVerification === 'CONSISTENT' ? '#10b981' : (report.aiVerification === 'INCONSISTENT' ? '#ef4444' : '#f59e0b'),
                          fontWeight: 600
                        }}>
                          AI: {report.aiVerification || 'PENDING'}
                        </span>
                        <span>👍 {report.confirmVotes || 0} · 👎 {report.disputeVotes || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </main>

      {/* 1-Screen Anonymous Report Submission Modal */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}
