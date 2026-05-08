import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import { createPurchaseRequest, evaluatePurchaseRequest, listAgents } from '../lib/api';
import { getStoredAgentId, getStoredOrgId, setStoredAgentId } from '../lib/storage';
import type { AgentRead, PurchaseEvaluationResponse } from '../types/api';
import type { AppContext } from '../types/app';

function statusMeta(status: string) {
  if (status === 'approved') {
    return { label: 'APPROVED', className: 'terminal-approved' };
  }
  if (status === 'denied') {
    return { label: 'DENIED', className: 'terminal-denied' };
  }
  return { label: 'NEEDS REVIEW', className: 'terminal-review' };
}

export default function SimulatorPage({ currentOrgId, currentOrgName, currentAgentId, currentPage = 'simulator', onNavigate }: Partial<AppContext> = {}) {
  const [agents, setAgents] = useState<AgentRead[]>([]);
  const [agentId, setAgentId] = useState<string | null>(currentAgentId ?? getStoredAgentId());
  const [merchant, setMerchant] = useState('STEAM GAMES EUROPE');
  const [amount, setAmount] = useState('59.99');
  const [category, setCategory] = useState('7994 - Video Game Arcades/Establishments');
  const [context, setContext] = useState('{"ip_region": "EU-WEST", "device_trust_score": 0.94}');
  const [result, setResult] = useState<PurchaseEvaluationResponse | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const orgId = useMemo(() => currentOrgId ?? getStoredOrgId(), [currentOrgId]);

  useEffect(() => {
    document.title = 'Simulator - AI_PAY_AUTH';
  }, []);

  useEffect(() => {
    if (!orgId) return;
    listAgents(orgId).then(setAgents).catch(() => setAgents([]));
  }, [orgId]);

  async function handleSubmit() {
    if (!agentId) return;
    const started = performance.now();
    const request = await createPurchaseRequest({
      agent_id: agentId,
      merchant,
      amount: Number(amount),
      category,
      reason: context,
    });
    const evaluation = await evaluatePurchaseRequest(request.id);
    const finished = performance.now();
    setLatency(Math.round(finished - started));
    setResult(evaluation);
  }

  const terminal = result ? statusMeta(result.decision_status) : statusMeta('approved');

  let parsedContext: Record<string, unknown> = {};
  try {
    parsedContext = context ? JSON.parse(context) : {};
  } catch {
    parsedContext = { raw: context };
  }

  const output = result
    ? {
        req_id: result.request_id,
        timestamp: new Date().toISOString(),
        model_version: 'auth_model_v2.1_strict',
        input_vector: {
          amount: Number(amount),
          currency: 'USD',
          mcc: category.split(' - ')[0],
          merchant_hash: merchant.slice(0, 6).toLowerCase() + '...99e',
          context: parsedContext,
        },
        evaluation: {
          velocity_check: 'PASS',
          geo_anomaly_score: 0.12,
          merchant_risk_tier: 'LOW',
          ml_fraud_probability: 0.0031,
        },
        decision: {
          status: terminal.label,
          confidence_score: 0.992,
          reason_codes: [result.reason],
          action_required: terminal.label === 'NEEDS REVIEW' ? 'HUMAN_REVIEW' : 'NONE',
          latency_ms: latency ?? 42,
        },
      }
    : null;

  return (
    <AppShell currentOrgId={currentOrgId} currentOrgName={currentOrgName} currentAgentId={currentAgentId} currentPage={currentPage} onNavigate={onNavigate}>
      <TopBar title="Authorization Console" showSearch searchPlaceholder="Search logs..." />

      <main className="page-main simulator-main">
        <div className="simulator-header">
          <h2 className="font-h2">Transaction Simulator</h2>
          <p className="text-muted">
            Test authorization logic against deployed AI models by injecting simulated transaction payloads.
          </p>
        </div>

        <div className="simulator-grid">
          <div className="simulator-card">
            <div className="simulator-card-header">
              <span className="font-mono-label">Payload Injector</span>
              <span className="material-symbols-outlined">input</span>
            </div>
            <div className="simulator-form">
              <div className="form-group">
                <label>Target Agent</label>
                <div className="select-wrap">
                  <select
                    value={agentId ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      setAgentId(value);
                      if (value) setStoredAgentId(value);
                    }}
                  >
                    <option value="">Select agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined">arrow_drop_down</span>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Merchant ID / Name</label>
                  <input value={merchant} onChange={(event) => setMerchant(event.target.value)} />
                </div>
                <div className="form-group">
                  <label>Amount (USD)</label>
                  <div className="input-money">
                    <span>$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>MCC / Category</label>
                <div className="select-wrap">
                  <select value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option value="5814 - Fast Food Restaurants">5814 - Fast Food Restaurants</option>
                    <option value="7994 - Video Game Arcades/Establishments">
                      7994 - Video Game Arcades/Establishments
                    </option>
                    <option value="4121 - Taxicabs and Limousines">4121 - Taxicabs and Limousines</option>
                  </select>
                  <span className="material-symbols-outlined">arrow_drop_down</span>
                </div>
              </div>

              <div className="form-group">
                <label>Context Data (Optional)</label>
                <textarea value={context} onChange={(event) => setContext(event.target.value)} rows={3} />
              </div>
            </div>
            <div className="simulator-actions">
              <button onClick={handleSubmit} disabled={!agentId}>
                <span className="material-symbols-outlined">play_arrow</span>
                Run Simulation
              </button>
            </div>
          </div>

          <div className={`terminal-card ${terminal.className}`}>
            <div className="terminal-header">
              <div className="terminal-state">
                <span className="pulse-dot" />
                <span>STATE: {terminal.label}</span>
              </div>
              <div className="terminal-actions">
                <button title="Copy Log">
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
                <button title="Clear">
                  <span className="material-symbols-outlined">clear_all</span>
                </button>
              </div>
            </div>
            <div className="terminal-body scroll-thin">
              <pre>{output ? JSON.stringify(output, null, 2) : '{\n  "status": "Awaiting simulation"\n}'}</pre>
              <span className="terminal-cursor">_</span>
            </div>
            <div className="terminal-footer">
              <span>EXECUTION TIME: {latency ?? 42}ms</span>
              <span>NODE: worker-eu-04</span>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
