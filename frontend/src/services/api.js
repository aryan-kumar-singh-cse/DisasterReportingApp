/**
 * TwoTruths - API Client Service
 * Connects to AWS API Gateway HTTP API or falls back gracefully to local state.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async isOnline() {
    if (!API_BASE_URL) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getReports() {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/reports`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      return data.reports;
    } catch (err) {
      console.warn('API fetch failed, falling back to local dataset:', err);
      return null;
    }
  },

  async createReport(reportData) {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (!res.ok) throw new Error('Failed to create report');
      const data = await res.json();
      return data.report;
    } catch (err) {
      console.warn('API createReport failed:', err);
      return null;
    }
  },

  async vote(reportId, type) {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (!res.ok) throw new Error('Failed to vote');
      const data = await res.json();
      return data.report;
    } catch (err) {
      console.warn('API vote failed:', err);
      return null;
    }
  },

  async challenge(reportId, payload) {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/reports/${reportId}/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to submit challenge');
      const data = await res.json();
      return data.report;
    } catch (err) {
      console.warn('API challenge failed:', err);
      return null;
    }
  },

  async getUploadUrl(fileType) {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/reports/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType })
      });
      if (!res.ok) throw new Error('Failed to get upload URL');
      return await res.json();
    } catch (err) {
      console.warn('API getUploadUrl failed:', err);
      return null;
    }
  }
};
