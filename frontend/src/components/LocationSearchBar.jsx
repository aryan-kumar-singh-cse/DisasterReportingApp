import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  MapPin,
  Loader2,
  Navigation,
  Clock,
  Globe,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const DEFAULT_INDIAN_HUBS = [
  { id: '19.07-72.87', name: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777 },
  { id: '28.61-77.20', name: 'Delhi', district: 'Central Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { id: '12.97-77.59', name: 'Bengaluru', district: 'Bangalore Urban', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  { id: '13.08-80.27', name: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
  { id: '22.57-88.36', name: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639 },
  { id: '11.68-76.13', name: 'Wayanad', district: 'Wayanad', state: 'Kerala', country: 'India', lat: 11.6854, lng: 76.1320 },
  { id: '18.52-73.85', name: 'Pune', district: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
  { id: '17.38-78.48', name: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867 }
];

export default function LocationSearchBar({
  onSelectLocation,
  onUseCurrentLocation,
  isLocating = false,
  placeholder = "Search city or district (e.g. Mumbai, Wayanad)..."
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Load recents from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('twotruths_recent_locations_v1');
      if (saved) setRecentSearches(JSON.parse(saved));
      else setRecentSearches(DEFAULT_INDIAN_HUBS.slice(0, 4));
    } catch {
      setRecentSearches(DEFAULT_INDIAN_HUBS.slice(0, 4));
    }
  }, []);

  // Global Keyboard Shortcut: Ctrl + K or / to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && document.activeElement !== inputRef.current && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Geocoding API Query
  const fetchSearchResults = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Local preset check first
      const localMatches = DEFAULT_INDIAN_HUBS.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.state.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Open-Meteo free geocoding query
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=8&language=en&format=json`
      );

      let apiMatches = [];
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          apiMatches = data.results.map((item) => ({
            id: `${item.latitude}-${item.longitude}`,
            name: item.name,
            district: item.admin2 || item.admin3 || '',
            state: item.admin1 || '',
            country: item.country || 'India',
            countryCode: item.country_code || '',
            lat: item.latitude,
            lng: item.longitude,
          }));
        }
      }

      // Merge and deduplicate
      const merged = [...localMatches, ...apiMatches];
      const seen = new Set();
      const unique = [];
      for (const m of merged) {
        const key = `${m.name.toLowerCase()}-${m.state.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(m);
        }
      }

      setResults(unique.slice(0, 8));
      setSelectedIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (val.trim().length >= 2) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchSearchResults(val.trim());
      }, 200);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  };

  const handleSelect = (loc) => {
    // Add to recents
    const updated = [loc, ...recentSearches.filter((item) => item.name.toLowerCase() !== loc.name.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('twotruths_recent_locations_v1', JSON.stringify(updated));
    } catch {}

    setQuery(loc.name);
    setResults([]);
    setIsOpen(false);
    if (onSelectLocation) onSelectLocation(loc);
  };

  const handleKeyDown = (e) => {
    const listToNavigate = results.length > 0 ? results : recentSearches;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < listToNavigate.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : listToNavigate.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && listToNavigate[selectedIndex]) {
        handleSelect(listToNavigate[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="absolute left-3 text-zinc-400 pointer-events-none flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-zinc-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-16 py-1.5 bg-zinc-900/90 border border-zinc-700/80 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-zinc-400 font-sans shadow-inner outline-none transition-all"
        />

        {/* Action icons right */}
        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Direct Live GPS Button */}
          {onUseCurrentLocation && (
            <button
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              title="Use Exact GPS Location"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isLocating
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                  : 'bg-zinc-800/80 border-zinc-700 hover:border-cyan-500/60 text-zinc-300 hover:text-cyan-300'
              }`}
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-zinc-950/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl p-2 z-50 animate-fade-in font-sans max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Matching Locations</span>
              </div>
              {results.map((loc, idx) => (
                <button
                  key={`${loc.lat}-${loc.lng}-${idx}`}
                  onClick={() => handleSelect(loc)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                    selectedIndex === idx ? 'bg-cyan-500/20 text-cyan-200' : 'hover:bg-zinc-900 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-white block">{loc.name}</span>
                      <span className="text-[10px] text-zinc-400">
                        {[loc.district, loc.state, loc.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Recent / Fast Hubs</span>
              </div>
              {recentSearches.map((loc, idx) => (
                <button
                  key={`${loc.lat}-${loc.lng}-${idx}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span className="text-xs">{loc.name}</span>
                    <span className="text-[10px] text-zinc-500">{loc.state || loc.country}</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">
                    {loc.lat.toFixed(1)}°, {loc.lng.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
