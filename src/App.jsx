import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RiskEngineProvider } from './context/RiskEngine';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ExecutiveOverview from './pages/ExecutiveOverview';
import VendorIntelligence from './pages/VendorIntelligence';
import VendorProfile from './pages/VendorProfile';
import WeightEngine from './pages/WeightEngine';
import GlobalEvents from './pages/GlobalEvents';

import ChainReaction from './pages/ChainReaction';
import AIAssistant from './pages/AIAssistant';
import SmartAlerts from './pages/SmartAlerts';
import VendorComparison from './pages/VendorComparison';
import GeoIntelligence from './pages/GeoIntelligence';
import SecurityAudit from './pages/SecurityAudit';
import Settings from './pages/Settings';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <RiskEngineProvider>
      <div className="app-layout">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className={`app-main ${!sidebarCollapsed ? 'sidebar-expanded' : ''}`}>
          <Topbar />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<ExecutiveOverview />} />
              <Route path="/vendors" element={<VendorIntelligence />} />
              <Route path="/vendor/:id" element={<VendorProfile />} />
              <Route path="/weights" element={<WeightEngine />} />
              <Route path="/events" element={<GlobalEvents />} />

              <Route path="/network" element={<ChainReaction />} />
              <Route path="/assistant" element={<AIAssistant />} />
              <Route path="/alerts" element={<SmartAlerts />} />
              <Route path="/comparison" element={<VendorComparison />} />
              <Route path="/geo" element={<GeoIntelligence />} />
              <Route path="/security" element={<SecurityAudit />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
    </RiskEngineProvider>
  );
}
