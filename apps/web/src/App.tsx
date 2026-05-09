import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import SetupPage from './pages/SetupPage';
import SimulatorPage from './pages/SimulatorPage';
import AgentDetailPage from './pages/AgentDetailPage';
import AuditLogPage from './pages/AuditLogPage';
import MandateEditorPage from './pages/MandateEditorPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/agent/:agentId" element={<AgentDetailPage />} />
        <Route path="/audit" element={<AuditLogPage />} />
        <Route path="/mandate/:agentId" element={<MandateEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
