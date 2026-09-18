import React from 'react';
import { ShieldCheck, AlertOctagon, HelpCircle, MapPin, Clock, User, Cpu, AlertTriangle } from 'lucide-react';
import VoteControls from './VoteControls';

export default function ReportCard({ report, onVote, onClose }) {
  if (!report) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONSISTENT':
        return {
          label: 'CONSISTENT',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: '#10b981',
          icon: <ShieldCheck size={16} color="#10b981" />
        };
      case 'INCONSISTENT':
        return {
          label: 'INCONSISTENT',
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '#ef4444',
          icon: <AlertOctagon size={16} color="#ef4444" />
        };
      case 'INCONCLUSIVE':
      default:
        return {
          label: 'INCONCLUSIVE',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: '#f59e0b',
          icon: <HelpCircle size={16} color="#f59e0b" />
        };
    }
  };

  const aiBadge = getStatusBadge(report.aiVerification);
  const timeAgo = report.createdAt ? new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>
              {report.disasterType === 'Flood' ? '🌊' : (report.disasterType === 'Fire' ? '🔥' : '⚠️')}
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>
              {report.disasterType}
            </h2>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={13} color="#38bdf8" />
              {report.locationName || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={13} />
              {timeAgo}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Incident Photo */}
      {report.photoUrl && (
        <div style={{ position: 'relative', marginBottom: '14px', borderRadius: '8px', overflow: 'hidden' }}>
          <img
            src={report.photoUrl}
            alt={report.disasterType}
            style={{
              width: '100%',
              height: '190px',
              objectFit: 'cover',
              display: 'block',
              border: '1px solid #334155'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#94a3b8',
            border: '1px solid #334155'
          }}>
            Citizen Submission Photo
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE TRANSPARENCY CARD (Core Novel Feature) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '14px'
      }}>
        {/* Column 1: Citizen Claim */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#38bdf8', fontSize: '12px', fontWeight: 600 }}>
            <User size={14} />
            <span>Citizen Claim</span>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Stated Severity</div>
          <div style={{
            display: 'inline-block',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: report.userSeverity === 'Critical' ? '#ef4444' : (report.userSeverity === 'High' ? '#f97316' : '#eab308'),
            color: '#ffffff',
            alignSelf: 'flex-start',
            marginBottom: '8px'
          }}>
            {report.userSeverity}
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Citizen Description</div>
          <p style={{
            fontSize: '12px',
            color: '#cbd5e1',
            margin: 0,
            lineHeight: 1.4,
            flex: 1
          }}>
            {report.description || 'No additional details provided by citizen.'}
          </p>
        </div>

        {/* Column 2: AI Evidence Assessment */}
        <div style={{
          backgroundColor: '#0f172a',
          border: `1px solid ${aiBadge.border}`,
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#a855f7', fontSize: '12px', fontWeight: 600 }}>
            <Cpu size={14} />
            <span>AI Assessment</span>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Consistency Outcome</div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: aiBadge.bg,
            color: aiBadge.color,
            border: `1px solid ${aiBadge.border}`,
            alignSelf: 'flex-start',
            marginBottom: '8px'
          }}>
            {aiBadge.icon}
            <span>{aiBadge.label}</span>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Detected Labels</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {report.aiDetectedLabels && report.aiDetectedLabels.length > 0 ? (
              report.aiDetectedLabels.slice(0, 4).map((lbl, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#94a3b8'
                  }}
                >
                  {lbl.name} <strong style={{ color: '#38bdf8' }}>{Math.round(lbl.confidence)}%</strong>
                </span>
              ))
            ) : (
              <span style={{ fontSize: '11px', color: '#64748b' }}>No decisive labels</span>
            )}
          </div>
        </div>
      </div>

      {/* Required Disclaimer Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        border: '1px solid rgba(234, 179, 8, 0.3)',
        borderRadius: '6px',
        padding: '6px 10px',
        fontSize: '11px',
        color: '#fde047',
        lineHeight: 1.3
      }}>
        <AlertTriangle size={15} style={{ flexShrink: 0 }} />
        <span>AI-assisted evidence assessment — not an emergency response authority.</span>
      </div>

      {/* Community Voting Controls */}
      <VoteControls
        reportId={report.reportId}
        confirmVotes={report.confirmVotes}
        disputeVotes={report.disputeVotes}
        verificationStatus={report.verificationStatus}
        onVote={onVote}
      />
    </div>
  );
}
