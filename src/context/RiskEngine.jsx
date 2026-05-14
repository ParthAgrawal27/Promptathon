import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { defaultWeights, riskProfiles, calcVendorScore, getRiskBand, getRiskColor, eventCatalog } from '../data/mockData';
import { loadVendors } from '../data/csvLoader';
import { getVendors, getAlerts, getLiveEvents, updateWeights as apiUpdateWeights, connectWebSocket, checkHealth } from '../services/api';

const RiskEngineContext = createContext(null);

export function RiskEngineProvider({ children }) {
  const [vendorRawData, setVendorRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weights, setWeights] = useState({ ...defaultWeights });
  const [activeProfile, setActiveProfile] = useState('balanced');
  const [activeEvents, setActiveEvents] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const wsRef = useRef(null);

  // Try backend first, fall back to CSV
  useEffect(() => {
    let cancelled = false;

    async function loadFromBackend() {
      try {
        // Check if backend is available
        await checkHealth();
        if (cancelled) return;

        // Fetch vendors from backend API
        const data = await getVendors(1, 5000);
        if (cancelled) return;

        // Transform backend vendor format to match frontend expectations
        const vendors = (data.vendors || []).map(v => ({
          id: parseInt(v.vendor_id.replace('V', ''), 10),
          vendorId: v.vendor_id,
          name: v.vendor_name,
          region: v.region,
          country: v.country,
          lat: v.lat,
          lng: v.lng,
          tier: v.tier,
          category: v.category,
          contractValue: v.contract_value,
          params: v.params,
          backendRiskScore: v.final_risk_score,
          backendRiskCategory: v.risk_category,
        }));

        setVendorRawData(vendors);
        setBackendConnected(true);
        setLoading(false);

        // Also fetch alerts & events
        try {
          const alertsData = await getAlerts(null, 100);
          if (!cancelled) setAlerts(alertsData.alerts || alertsData || []);
        } catch { /* alerts not critical */ }

        try {
          const eventsData = await getLiveEvents(50);
          if (!cancelled) setLiveEvents(eventsData.events || eventsData || []);
        } catch { /* events not critical */ }

        console.log('✅ VendorIQ: Connected to backend API');
        return true;
      } catch (err) {
        console.warn('⚠ Backend unavailable, falling back to CSV:', err.message);
        return false;
      }
    }

    async function loadData() {
      const backendOk = await loadFromBackend();
      if (!backendOk && !cancelled) {
        // Fallback to CSV
        try {
          const vendors = await loadVendors();
          if (!cancelled) {
            setVendorRawData(vendors);
            setLoading(false);
            console.log('📄 VendorIQ: Loaded from CSV fallback');
          }
        } catch (err) {
          console.error('Failed to load vendor data:', err);
          if (!cancelled) setLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // WebSocket connection for live updates
  useEffect(() => {
    if (!backendConnected) return;

    try {
      wsRef.current = connectWebSocket('live-risk', (data) => {
        if (data.type === 'risk_update' && data.vendors) {
          // Update vendor scores from backend push
          setVendorRawData(prev => {
            const updated = [...prev];
            data.vendors.forEach(update => {
              const idx = updated.findIndex(v => v.vendorId === update.vendor_id);
              if (idx !== -1) {
                updated[idx] = {
                  ...updated[idx],
                  backendRiskScore: update.final_risk_score,
                  backendRiskCategory: update.risk_category,
                };
              }
            });
            return updated;
          });
        }
        if (data.type === 'alert') {
          setAlerts(prev => [data, ...prev].slice(0, 100));
        }
        if (data.type === 'dashboard_refresh') {
          getLiveEvents(50).then(eventsData => {
            setLiveEvents(eventsData.events || eventsData || []);
          }).catch(console.error);
        }
      });
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [backendConnected]);

  // Single weight update
  const updateWeight = useCallback((param, value) => {
    setWeights(prev => ({ ...prev, [param]: Math.max(0, Math.min(100, Number(value))) }));
    setActiveProfile('custom');
  }, []);

  // Apply a preset profile
  const applyProfile = useCallback((profileId) => {
    const profile = riskProfiles.find(p => p.id === profileId);
    if (profile) {
      setWeights({ ...profile.weights });
      setActiveProfile(profileId);
    }
  }, []);

  // Inject a global event
  const injectEvent = useCallback((eventId) => {
    const evt = eventCatalog.find(e => e.id === eventId);
    if (evt && !activeEvents.find(e => e.id === eventId)) {
      setActiveEvents(prev => [...prev, evt]);
    }
  }, [activeEvents]);

  // Remove an event
  const removeEvent = useCallback((eventId) => {
    setActiveEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  // Clear all events
  const clearEvents = useCallback(() => setActiveEvents([]), []);

  // Compute all vendor scores (memoized)
  const scoredVendors = useMemo(() => {
    if (vendorRawData.length === 0) return [];
    return vendorRawData.map(v => {
      const { score, contributions, modifiedParams } = calcVendorScore(v, weights, activeEvents);
      return {
        ...v,
        riskScore: score,
        riskBand: getRiskBand(score),
        riskColor: getRiskColor(score),
        contributions,
        modifiedParams,
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [vendorRawData, weights, activeEvents]);

  // Summary stats
  const stats = useMemo(() => {
    if (scoredVendors.length === 0) return { critical: 0, high: 0, moderate: 0, low: 0, avg: 0, total: 0 };
    const critical = scoredVendors.filter(v => v.riskBand === 'Critical').length;
    const high = scoredVendors.filter(v => v.riskBand === 'High').length;
    const moderate = scoredVendors.filter(v => v.riskBand === 'Moderate').length;
    const low = scoredVendors.filter(v => v.riskBand === 'Low').length;
    const avg = Math.round(scoredVendors.reduce((a, v) => a + v.riskScore, 0) / scoredVendors.length);
    return { critical, high, moderate, low, avg, total: scoredVendors.length };
  }, [scoredVendors]);

  const value = {
    weights, updateWeight, applyProfile, activeProfile,
    activeEvents, injectEvent, removeEvent, clearEvents,
    scoredVendors, stats, loading,
    backendConnected, alerts, liveEvents,
  };

  return <RiskEngineContext.Provider value={value}>{children}</RiskEngineContext.Provider>;
}

export function useRiskEngine() {
  const ctx = useContext(RiskEngineContext);
  if (!ctx) throw new Error('useRiskEngine must be used within RiskEngineProvider');
  return ctx;
}
