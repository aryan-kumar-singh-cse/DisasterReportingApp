import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, AlertTriangle } from 'lucide-react';

export default function VoteControls({
  reportId,
  confirmVotes = 0,
  disputeVotes = 0,
  verificationStatus = 'AI_ASSESSED',
  onVote
}) {
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && reportId) {
      const storedVote = localStorage.getItem(`resq_vote_${reportId}`);
      if (storedVote) {
        setHasVoted(true);
        setUserVote(storedVote);
      } else {
        setHasVoted(false);
        setUserVote(null);
      }
    }
  }, [reportId]);

  const handleVote = (type) => {
    if (hasVoted) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem(`resq_vote_${reportId}`, type);
    }
    setHasVoted(true);
    setUserVote(type);

    if (onVote) {
      onVote(reportId, type);
    }
  };

  const isConfirmed = verificationStatus === 'COMMUNITY_CONFIRMED';
  const isDisputed = verificationStatus === 'DISPUTED' || verificationStatus === 'FALSE';

  return (
    <div style={{
      backgroundColor: '#0f172a',
      borderRadius: '8px',
      padding: '12px 14px',
      border: '1px solid #334155',
      marginTop: '14px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
          Community Verification
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: isConfirmed ? 'rgba(16, 185, 129, 0.2)' : (isDisputed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(148, 163, 184, 0.2)'),
          color: isConfirmed ? '#10b981' : (isDisputed ? '#ef4444' : '#94a3b8'),
          border: `1px solid ${isConfirmed ? '#10b981' : (isDisputed ? '#ef4444' : '#64748b')}`
        }}>
          {verificationStatus.replace('_', ' ')}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => handleVote('CONFIRM')}
          disabled={hasVoted}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '6px',
            border: userVote === 'CONFIRM' ? '2px solid #10b981' : '1px solid #334155',
            backgroundColor: userVote === 'CONFIRM' ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
            color: '#f8fafc',
            cursor: hasVoted ? 'default' : 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.15s ease'
          }}
        >
          <ThumbsUp size={15} color={userVote === 'CONFIRM' ? '#10b981' : '#38bdf8'} />
          <span>Confirm ({confirmVotes})</span>
        </button>

        <button
          onClick={() => handleVote('DISPUTE')}
          disabled={hasVoted}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '6px',
            border: userVote === 'DISPUTE' ? '2px solid #ef4444' : '1px solid #334155',
            backgroundColor: userVote === 'DISPUTE' ? 'rgba(239, 68, 68, 0.2)' : '#1e293b',
            color: '#f8fafc',
            cursor: hasVoted ? 'default' : 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.15s ease'
          }}
        >
          <ThumbsDown size={15} color={userVote === 'DISPUTE' ? '#ef4444' : '#f43f5e'} />
          <span>Dispute ({disputeVotes})</span>
        </button>
      </div>

      {hasVoted && (
        <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
          ✓ Your vote has been recorded for this session.
        </div>
      )}
    </div>
  );
}
