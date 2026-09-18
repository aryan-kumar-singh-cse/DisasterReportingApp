import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import { DISASTER_TYPES, SEVERITY_LEVELS, AI_VERIFICATION_STATUSES } from '../data/schema';

export default function FilterBar({
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  incidentCount = 0
}) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '10px 20px',
      backgroundColor: '#1e293b',
      borderBottom: '1px solid #334155',
      zIndex: 900
    }}>
      {/* Left: Filter Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px' }}>
          <Filter size={15} color="#38bdf8" />
          <span>Filters:</span>
        </div>

        {/* Disaster Type Filter */}
        <select
          value={filters.disasterType}
          onChange={(e) => onFilterChange({ ...filters, disasterType: e.target.value })}
          style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Disaster Types</option>
          {DISASTER_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Severity Filter */}
        <select
          value={filters.severity}
          onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
          style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Severities</option>
          {SEVERITY_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>

        {/* AI Status Filter */}
        <select
          value={filters.aiStatus}
          onChange={(e) => onFilterChange({ ...filters, aiStatus: e.target.value })}
          style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="All">All AI Outcomes</option>
          {AI_VERIFICATION_STATUSES.map((status) => (
            <option key={status} value={status}>AI: {status}</option>
          ))}
        </select>
      </div>

      {/* Right: Sort & Incident Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px' }}>
          <ArrowUpDown size={15} color="#38bdf8" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="severity">Sort: Highest Severity</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
          Showing <strong>{incidentCount}</strong> reports
        </div>
      </div>
    </div>
  );
}
