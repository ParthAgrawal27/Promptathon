import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { vendorRawData, defaultWeights, riskProfiles, calcVendorScore, getRiskBand, getRiskColor, eventCatalog } from '../data/mockData';

const RiskEngineContext = createContext(null);

export function RiskEngineProvider({ children }) {
  const [weights, setWeights] = useState({ ...defaultWeights });
  const [activeProfile, setActiveProfile] = useState('balanced');
  const [activeEvents, setActiveEvents] = useState([]);

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
  }, [weights, activeEvents]);

  // Summary stats
  const stats = useMemo(() => {
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
    scoredVendors, stats,
  };

  return <RiskEngineContext.Provider value={value}>{children}</RiskEngineContext.Provider>;
}

export function useRiskEngine() {
  const ctx = useContext(RiskEngineContext);
  if (!ctx) throw new Error('useRiskEngine must be used within RiskEngineProvider');
  return ctx;
}
