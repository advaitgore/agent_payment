import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import AgentDetailPage from './pages/AgentDetailPage';
import AuditLogPage from './pages/AuditLogPage';
import DashboardPage from './pages/DashboardPage';
import MandateEditorPage from './pages/MandateEditorPage';
import SetupPage from './pages/SetupPage';
import SimulatorPage from './pages/SimulatorPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="/audit-log" element={<AuditLogPage />} />
      <Route path="/mandates/:mandateId" element={<MandateEditorPage />} />
      <Route path="/agents/:agentId" element={<AgentDetailPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
