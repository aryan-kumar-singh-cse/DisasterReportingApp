import React, { useState } from 'react';
import { X, MessageSquare, Camera, Loader2, CheckCircle2 } from 'lucide-react';

export default function ChallengeModal({ report, isOpen, onClose, onSubmitChallenge }) {
  const [contextNote, setContextNote] = useState('');
  const [counterPhotoUrl, setCounterPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !report) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCounterPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleChallenge = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Simulate successful challenge resolution
      const updatedReport = {
        ...report,
        aiVerification: 'CONSISTENT',
        dissonanceScore: 0.15,
        aiSummary: `Assessment updated to CONSISTENT following citizen challenge: "${contextNote || 'Clearer corroborating photo provided.'}"`,
        challengeHistory: [
          ...(report.challengeHistory || []),
          {
            timestamp: new Date().toISOString(),
            photoUrl: counterPhotoUrl || report.photoUrl,
            contextNote: contextNote || 'Citizen provided clearer visual angle and context.',
            aiVerification: report.aiVerification,
            dissonanceScore: report.dissonanceScore,
            aiSummary: report.aiSummary
          }
        ],
        triageScore: Math.min(1.0, (report.triageScore || 0.4) + 0.35)
      };

      onSubmitChallenge(updatedReport);
      setIsSubmitting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400">
              <MessageSquare className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">Challenge AI Assessment</h2>
              <p className="text-[11px] text-zinc-400">TwoTruths treats AI as a second witness, not a judge.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleChallenge} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs">
            <span className="text-zinc-400 block mb-0.5">Current AI read of initial photo:</span>
            <span className="text-red-400 font-semibold">{report.aiVerification}</span>
            <p className="text-[11px] text-zinc-400 mt-1 italic">"{report.aiSummary}"</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Context Note / What did the photo miss?
            </label>
            <textarea
              rows={3}
              value={contextNote}
              onChange={(e) => setContextNote(e.target.value)}
              placeholder="e.g., 'The active flame is behind the building wall, trees were blocking direct line of sight.'"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Upload 2nd Angle / Clearer Evidence (Optional)
            </label>
            <div className="border border-dashed border-zinc-800 rounded-lg p-3 text-center cursor-pointer bg-zinc-900/30 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {counterPhotoUrl ? (
                <img src={counterPhotoUrl} alt="Counter photo" className="max-h-24 mx-auto rounded object-cover" />
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs py-1">
                  <Camera className="w-4 h-4 text-zinc-500" />
                  <span>Choose second image</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Re-assessing...</span>
                </>
              ) : (
                <span>Submit Challenge</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
