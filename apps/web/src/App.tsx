import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import SimulatorPage from './pages/SimulatorPage';
import AgentDetail from './components/AgentDetail';
import AuditLog from './components/AuditLog';
import type { MandateCreate, PurchaseRequestRead } from './types/api';
import type { AppPage } from './types/app';
import {
  createAgent,
  createMandate,
  createOrg,
  listRequests,
} from './lib/api';
import {
  getStoredAgentId,
  getStoredOrgId,
  getStoredOrgName,
  setStoredAgentId,
  setStoredMandateId,
  setStoredOrgId,
  setStoredOrgName,
} from './lib/storage';

export default function App() {
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(() => getStoredOrgId());
  const [currentOrgName, setCurrentOrgName] = useState<string | null>(() => getStoredOrgName());
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(() => getStoredAgentId());
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [requests, setRequests] = useState<PurchaseRequestRead[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      if (!currentAgentId) {
        setRequests([]);
        setRequestsLoading(false);
        setRequestsError(null);
        return;
      }

      setRequestsLoading(true);
      setRequestsError(null);
      try {
        const data = await listRequests(currentAgentId);
        if (!cancelled) {
          setRequests(data);
        }
      } catch (error) {
        if (!cancelled) {
          setRequestsError(error instanceof Error ? error.message : 'Failed to load requests.');
        }
      } finally {
        if (!cancelled) {
          setRequestsLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [currentAgentId]);

  useEffect(() => {
    document.title = 'AI_PAY_AUTH';
  }, []);

  const appContext = {
    currentOrgId,
    currentOrgName,
    currentAgentId,
    currentPage,
    onNavigate: navigate,
  };

  async function handleCreateOrg(name: string) {
    const org = await createOrg({ name });
    setCurrentOrgId(org.id);
    setCurrentOrgName(org.name);
    setStoredOrgId(org.id);
    setStoredOrgName(org.name);
  }

  async function handleCreateAgent(name: string) {
    if (!currentOrgId) {
      return undefined;
    }
    const agent = await createAgent({ org_id: currentOrgId, name });
    setCurrentAgentId(agent.id);
    setStoredAgentId(agent.id);
    return agent;
  }

  async function handleCreateMandate(payload: MandateCreate) {
    const mandate = await createMandate(payload);
    setStoredMandateId(mandate.id);
  }

  function navigate(page: AppPage) {
    setCurrentPage(page);
  }

  if (currentPage === 'setup') {
    return (
      <Setup
        {...appContext}
        onCreateOrg={handleCreateOrg}
        onCreateAgent={handleCreateAgent}
        onCreateMandate={handleCreateMandate}
      />
    );
  }

  if (currentPage === 'simulator') {
    return <SimulatorPage {...appContext} />;
  }

  if (currentPage === 'agent') {
    return <AgentDetail {...appContext} />;
  }

  if (currentPage === 'audit') {
    return <AuditLog {...appContext} />;
  }

  return (
    <Dashboard
      {...appContext}
      loading={requestsLoading}
      error={requestsError}
      requests={requests}
    />
  );
}
