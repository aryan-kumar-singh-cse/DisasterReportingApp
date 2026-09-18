import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, ShieldAlert, FileCode } from 'lucide-react';

export default function EvidenceChain({ report }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!report) return null;

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden mt-3">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>AWS Rekognition & Gemini Vision Audit</span>
          <span className="text-[10px] text-orange-300 bg-orange-950/70 border border-orange-700/60 px-2 py-0.5 rounded font-mono">
            AWS Rekognition
          </span>
          <span className="text-[10px] text-cyan-300 bg-cyan-950/70 border border-cyan-700/60 px-2 py-0.5 rounded font-mono">
            Gemini 2.0
          </span>
          <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full font-mono">
            {report.aiDetectedLabels?.length || 0} labels
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/70 space-y-4">
          {/* AWS Rekognition & Gemini Pipeline Status Bar */}
          <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-300">AWS API Gateway:</span>
              <span className="text-orange-400 text-[10px] truncate max-w-[200px]">jg6nmd89lg.execute-api</span>
            </div>
            <span className="text-cyan-400 text-[10px]">Gemini Vision Synchronized</span>
          </div>
          {/* Detected Labels with Confidence Bars */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Detected Vision Labels & Confidence
            </span>
            <div className="space-y-2">
              {report.aiDetectedLabels && report.aiDetectedLabels.map((lbl, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-200 font-medium">{lbl.name}</span>
                    <span className="text-cyan-400 font-mono">{lbl.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${lbl.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Negative Space Panel (What the AI didn't see) */}
          {report.negativeSpace && report.negativeSpace.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Negative Space Analysis (What AI didn't see)</span>
              </div>
              <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
                {report.negativeSpace.map((neg, i) => (
                  <li key={i}>{neg}</li>
                ))}
              </ul>
              <p className="text-[10px] text-zinc-500 mt-2 italic">
                *Explicitly checking for the absence of hazard signatures prevents false positive confirmation.
              </p>
            </div>
          )}

          {/* Raw JSON Toggle for Technical Judges */}
          <div>
            <button
              type="button"
              onClick={() => setShowJson(!showJson)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded bg-zinc-900 border border-zinc-800 font-mono"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showJson ? 'Hide Raw JSON' : 'Inspect AWS Rekognition & Gemini Payload'}</span>
            </button>

            {showJson && (
              <pre className="mt-2 p-3 rounded-lg bg-black/90 border border-zinc-800 text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-48 scrollbar-thin">
                {JSON.stringify(
                  {
                    awsRekognitionPipeline: {
                      endpoint: "https://jg6nmd89lg.execute-api.ap-south-1.amazonaws.com",
                      action: "rekognition:DetectLabels",
                      region: "ap-south-1",
                      detectedLabels: report.aiDetectedLabels
                    },
                    geminiVisionPipeline: {
                      model: "gemini-2.0-flash / gemini-vision",
                      aiVerification: report.aiVerification,
                      dissonanceScore: report.dissonanceScore,
                      negativeSpace: report.negativeSpace,
                      aiSummary: report.aiSummary
                    },
                    incidentMetadata: {
                      reportId: report.reportId,
                      disasterTypeClaim: report.disasterType,
                      userSeverity: report.userSeverity,
                      triageScore: report.triageScore
                    }
                  },
                  null,
                  2
                )}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
