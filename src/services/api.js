/* ═══════════════════════════════════════════════════════════════════
   VendorIQ — Backend API Service
   Centralised API client for all backend communication.
   ═══════════════════════════════════════════════════════════════════ */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

// ── Helper ──────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${errText || res.statusText}`);
  }
  return res.json();
}

// ── Health ──────────────────────────────────────────────────────
export const checkHealth = () => apiFetch('/');
export const getStats = () => apiFetch('/api/stats');

// ── Vendors ─────────────────────────────────────────────────────
export const getVendors = (page = 1, perPage = 5000) =>
  apiFetch(`/api/vendors?page=${page}&per_page=${perPage}`);

export const getVendorById = (vendorId) =>
  apiFetch(`/api/vendor/${vendorId}`);

// ── Risk ────────────────────────────────────────────────────────
export const updateWeights = (weights) =>
  apiFetch('/api/update-weights', {
    method: 'POST',
    body: JSON.stringify({ weights }),
  });

export const calculateRisk = (vendorId, weights, activeEvents = []) =>
  apiFetch('/api/calculate-risk', {
    method: 'POST',
    body: JSON.stringify({
      vendor_id: vendorId,
      weights,
      active_events: activeEvents,
    }),
  });

export const recalculateAll = (weights, activeEvents = []) =>
  apiFetch('/api/recalculate-all', {
    method: 'POST',
    body: JSON.stringify({ weights, active_events: activeEvents }),
  });

export const getRiskHistory = (vendorId) =>
  apiFetch(`/api/risk-history?vendor_id=${vendorId}`);

// ── Events ──────────────────────────────────────────────────────
export const getLiveEvents = (limit = 50) =>
  apiFetch(`/api/live-events?limit=${limit}`);

export const injectEvent = (eventData) =>
  apiFetch('/api/inject-event', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });

export const getEventImpacts = (eventId) =>
  apiFetch(`/api/event-impacts?event_id=${eventId}`);

export const triggerNewsFetch = () =>
  apiFetch('/api/trigger-news-fetch', { method: 'POST' });

// ── Alerts ──────────────────────────────────────────────────────
export const getAlerts = (severity, limit = 100) => {
  let path = `/api/alerts?limit=${limit}`;
  if (severity) path += `&severity=${severity}`;
  return apiFetch(path);
};

export const getUnreadAlertCount = () =>
  apiFetch('/api/alerts/unread-count');

export const markAllAlertsRead = () =>
  apiFetch('/api/alerts/mark-all-read', { method: 'POST' });

export const markAlertRead = (alertId) =>
  apiFetch(`/api/alerts/${alertId}/read`, { method: 'POST' });

// ── Simulation ──────────────────────────────────────────────────
export const runSimulation = (params) =>
  apiFetch('/api/simulate', {
    method: 'POST',
    body: JSON.stringify(params),
  });

// ── WebSocket ───────────────────────────────────────────────────
export function connectWebSocket(channel, onMessage, onError) {
  const url = `${WS_BASE}/ws/${channel}`;
  const ws = new WebSocket(url);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      onMessage(event.data);
    }
  };

  ws.onerror = (err) => {
    console.error(`WS [${channel}] error:`, err);
    onError?.(err);
  };

  ws.onclose = () => {
    console.log(`WS [${channel}] closed, reconnecting in 5s...`);
    setTimeout(() => connectWebSocket(channel, onMessage, onError), 5000);
  };

  return ws;
}

export default {
  checkHealth, getStats,
  getVendors, getVendorById,
  updateWeights, calculateRisk, recalculateAll, getRiskHistory,
  getLiveEvents, injectEvent, getEventImpacts, triggerNewsFetch,
  getAlerts, getUnreadAlertCount, markAllAlertsRead, markAlertRead,
  runSimulation,
  connectWebSocket,
};
