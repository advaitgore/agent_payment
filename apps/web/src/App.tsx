import { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Setup from './components/Setup';
import Simulator, { DecisionTerminal } from './components/Simulator';
import Dashboard from './components/Dashboard';
import {
  createOrg,
  createAgent,
  createMandate,
  createPurchaseRequest,
  evaluatePurchaseRequest,
  listRequests,
} from './lib/api';
import type {
  AgentRead,
  OrganizationRead,
  MandateCreate,
  PurchaseRequestCreate,
  PurchaseRequestRead,
  PurchaseEvaluationResponse,
} from './types/api';

function AppContent() {
  const [agents, setAgents] = useState<AgentRead[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentRead | null>(null);
  const [org, setOrg] = useState<OrganizationRead | null>(null);
  const [requests, setRequests] = useState<PurchaseRequestRead[]>([]);
  const [lastDecision, setLastDecision] = useState<PurchaseEvaluationResponse | null>(null);

  useEffect(() => {
    // no-op on mount; agents loaded after org/agent creation flows
  }, []);

  async function handleCreateOrg(name: string) {
    const o = await createOrg({ name });
    setOrg(o);
  }

  async function handleCreateAgent(name: string) {
    if (!org) return;
    const a = await createAgent({ org_id: org.id, name });
    setAgents((s) => [...s, a]);
    setSelectedAgent(a);
    return a;
  }

  async function handleCreateMandate(data: MandateCreate) {
    await createMandate(data);
  }

  // refreshAgents is available if needed later

  useEffect(() => {
    if (selectedAgent) {
      refreshRequests(selectedAgent.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent]);

  async function refreshRequests(agentId: string) {
    const rs = await listRequests(agentId);
    setRequests(rs || []);
  }

  async function handleSimulateRequest(payload: PurchaseRequestCreate) {
    const pr = await createPurchaseRequest(payload);
    const evalRes = await evaluatePurchaseRequest(pr.id);
    setLastDecision(evalRes);
    if (selectedAgent) await refreshRequests(selectedAgent.id);
  }

  return (
    <div className="app-grid">
      <Sidebar>
        <h2>Setup</h2>
        <Setup
          onCreateOrg={handleCreateOrg}
          onCreateAgent={handleCreateAgent}
          onCreateMandate={handleCreateMandate}
          agents={agents}
        />
      </Sidebar>

      <main className="main">
        <section className="panel">
          <h3>Request Simulator</h3>
          <Simulator
            agents={agents}
            selectedAgent={selectedAgent}
            onSelectAgent={(a) => setSelectedAgent(a)}
            onSubmit={handleSimulateRequest}
          />
          {lastDecision && <DecisionTerminal result={lastDecision} />}
        </section>

        <section className="panel">
          <h3>Dashboard</h3>
          <Dashboard requests={requests} />
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-root">
      <header className="topbar">Agent Payment Dashboard</header>
      <AppContent />
    </div>
  );
}
