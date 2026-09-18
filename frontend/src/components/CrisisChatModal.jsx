import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  Loader2,
  RefreshCw,
  MapPin,
  Flame,
  CloudRain,
  Zap,
  Info
} from 'lucide-react';
import { askCrisisAgent } from '../services/groqService';

const SUGGESTED_PROMPTS = [
  { text: "🏫 SRM Modinagar Live Crisis Status", icon: ShieldAlert },
  { text: "🌊 Flash Flood Evacuation Protocol", icon: CloudRain },
  { text: "🔥 High-Rise Fire Safety Rules", icon: Flame },
  { text: "⚡ Lightning Strike Survival Guidelines", icon: Zap }
];

export default function CrisisChatModal({
  isOpen,
  onClose,
  currentLocation = 'Active Incident Sector',
  selectedReport = null
}) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      content: `🛡️ **ResQ AI Crisis Intelligence Engine Active** (Powered by Groq & Google AI)\n\nI am your live emergency assistant. Ask me about real-time disaster conditions for any campus or city (e.g., **SRM Modinagar**, **Mumbai**, **Delhi-NCR**), evacuation routing, emergency shelter coordinates, or live weather hazard guidance.`,
      agent: 'Groq AI Tactical Core'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (userText = null) => {
    const textToSend = userText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInputValue('');
    setIsLoading(true);

    try {
      const loc = selectedReport?.locationName || currentLocation || 'Active Incident Area';
      const res = await askCrisisAgent(textToSend, messages, loc);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res?.response || 'ResQ Emergency protocol: stay sheltered and monitor national emergency 112.',
        agent: res?.agent || 'Groq AI Tactical Agent'
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Connection timeout. For immediate peril dial national emergency **112**. Follow NDMA safety guidelines.',
          agent: 'ResQ Fail-Safe'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleGlobalKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen, onClose]);

  const clearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `🛡️ **ResQ AI Crisis Intelligence Core Reset**\nReady for crisis inquiries across any campus, district, or sector.`,
        agent: 'Groq AI Tactical Core'
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl h-[85vh] rounded-3xl bg-zinc-950/95 border border-cyan-500/40 shadow-2xl shadow-cyan-500/15 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">ResQ Crisis AI Assistant</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  Groq / Google AI
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Global Crisis Intelligence Grid • Active Telemetry</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              title="Reset conversation"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900/40 border-b border-zinc-800 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono uppercase text-zinc-500 shrink-0">Quick Action:</span>
          {SUGGESTED_PROMPTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-cyan-950/60 border border-zinc-800 hover:border-cyan-500/40 text-[11px] text-zinc-300 hover:text-cyan-200 transition shrink-0 flex items-center gap-1.5 cursor-pointer font-sans shadow-sm"
              >
                <Icon className="w-3 h-3 text-cyan-400" />
                <span>{p.text}</span>
              </button>
            );
          })}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto font-sans text-xs scrollbar-thin scrollbar-thumb-zinc-700">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium'
                    : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 leading-relaxed'
                }`}
              >
                <div className="whitespace-pre-line text-xs">
                  {m.content}
                </div>

                {m.agent && (
                  <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                    <Sparkles className="w-3 h-3" />
                    <span>{m.agent}</span>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="rounded-2xl px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>ResQ Agent reasoning via Groq 120B...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ResQ anything (e.g. SRM Modinagar live disaster updates, flood safety, shelter coordinates)..."
              className="w-full pl-4 pr-12 py-3 bg-zinc-950 border border-zinc-700/80 focus:border-cyan-400 rounded-2xl text-xs text-white placeholder-zinc-500 outline-none transition-all shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-all cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-2 text-[10px] text-zinc-500 flex items-center justify-between font-mono">
            <span>Official Life Safety Hotline: 112 • NDRF: 1078</span>
            <span>Press Enter to dispatch message</span>
          </div>
        </div>
      </div>
    </div>
  );
}
