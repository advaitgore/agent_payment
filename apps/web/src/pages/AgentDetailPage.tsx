import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import { getAgent, getSpendingSummary, listMandates, listRequests, rotateAgentKey } from '../lib/api';
import { setStoredAgentId, setStoredMandateId } from '../lib/storage';
import type { AgentRead, MandateRead, PurchaseRequestRead, SpendingSummary } from '../types/api';

export default function AgentDetailPage() {
  const { agentId } = useParams();
  const [agent, setAgent] = useState<AgentRead | null>(null);
  const [mandate, setMandate] = useState<MandateRead | null>(null);
  const [requests, setRequests] = useState<PurchaseRequestRead[]>([]);
  const [spending, setSpending] = useState<SpendingSummary | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    document.title = 'Agent Detail - AI_PAY_AUTH';
  }, []);

  useEffect(() => {
    if (!agentId) return;
    setStoredAgentId(agentId);
    getAgent(agentId)
      .then(setAgent)
      .catch(() => setAgent(null));

    listMandates(agentId)
      .then((items) => {
        const first = items[0] ?? null;
        setMandate(first);
        if (first) setStoredMandateId(first.id);
      })
      .catch(() => setMandate(null));

    listRequests(agentId)
      .then((items) => setRequests(items.slice(0, 4)))
      .catch(() => setRequests([]));

    getSpendingSummary(agentId)
      .then(setSpending)
      .catch(() => setSpending(null));
  }, [agentId]);

  async function handleRotateKey() {
    if (!agentId) return;
    const updated = await rotateAgentKey(agentId);
    setAgent(updated);
    setShowKey(true);
  }

  const monthlyCap = mandate ? Number(mandate.approval_threshold) : 500;
  const used = spending ? Number(spending.total_spent) : 0;
  const remaining = Math.max(monthlyCap - used, 0);
  const progress = monthlyCap ? Math.min((used / monthlyCap) * 100, 100) : 0;

  return (
    <AppShell>
      <TopBar title="Authorization Console" breadcrumb={agent?.name ?? 'trading-bot-alpha-v2'} showSearch={false} />

      <main className="page-main agent-main">
        <div className="agent-container">
          <div className="agent-header">
            <div>
              <div className="agent-title-row">
                <h1 className="font-h1">{agent?.name ?? 'trading-bot-alpha-v2'}</h1>
                <span className="agent-status">ACTIVE</span>
              </div>
              <p className="agent-id">AGENT_ID: {agent?.id ?? '0x7472_6164_696e_675f_626f_74'}</p>
            </div>
            <div className="agent-actions">
              <button className="btn-secondary">Deactivate</button>
              <button className="btn-primary">Edit Config</button>
            </div>
          </div>

          <div className="agent-grid">
            <section className="agent-card key-card">
              <div className="card-header">
                <h2>API Key Management</h2>
                <span className="card-meta">CREATED: {agent?.created_at ?? '2023.10.24 14:02 UTC'}</span>
              </div>
              <div className="card-body">
                <label>SECRET_KEY</label>
                <div className="key-row">
                  <div className="key-value">
                    <span className="key-mask">
                      {showKey ? agent?.api_key ?? '' : '******************************'}
                    </span>
                    <button onClick={() => setShowKey((prev) => !prev)}>
                      <span className="material-symbols-outlined">visibility</span>
                      {showKey ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                  <button className="icon-button">
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </div>
              <div className="card-footer">
                <p>Rotating your key will immediately invalidate the existing token. All active sessions will terminate.</p>
                <button className="btn-outline" onClick={handleRotateKey}>
                  <span className="material-symbols-outlined">sync</span>
                  Rotate Key
                </button>
              </div>
            </section>

            <section className="agent-card system-card">
              <h2>System Health</h2>
              <div className="system-chart">
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
              </div>
              <div className="system-metrics">
                <div>
                  <span>Latency</span>
                  <strong>24ms</strong>
                </div>
                <div>
                  <span>Success Rate</span>
                  <strong className="text-tertiary">99.98%</strong>
                </div>
              </div>
            </section>

            <section className="agent-card mandate-summary">
              <div className="card-header">
                <h2>Current Mandate Summary</h2>
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div className="mandate-summary-grid">
                <div className="summary-block">
                  <div className="summary-title">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                    Spending Limits
                  </div>
                  <div className="summary-card">
                    <div className="summary-row">
                      <span>Monthly cap</span>
                      <strong>${monthlyCap.toFixed(2)}</strong>
                    </div>
                    <div className="summary-bar">
                      <div style={{ width: `${progress}%` }} />
                    </div>
                    <div className="summary-row small">
                      <span>USED: ${used.toFixed(2)}</span>
                      <span>REMAINING: ${remaining.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="summary-block">
                  <div className="summary-title">
                    <span className="material-symbols-outlined">verified_user</span>
                    Allowed Merchants
                  </div>
                  <div className="summary-list">
                    {(mandate?.allowed_merchants ?? []).slice(0, 2).map((merchant) => (
                      <div className="summary-item" key={merchant}>
                        <span>{merchant}</span>
                        <span className="material-symbols-outlined text-tertiary">check_circle</span>
                      </div>
                    ))}
                    <button className="summary-add">+ Add Merchant</button>
                  </div>
                </div>

                <div className="summary-block">
                  <div className="summary-title">
                    <span className="material-symbols-outlined">policy</span>
                    Active Policies
                  </div>
                  <div className="policy-list">
                    <div>
                      <span>POL_091_ENFORCE_GEO</span>
                      <small>Transaction origin must match US-East.</small>
                    </div>
                    <div>
                      <span>POL_212_MANDATE_ID</span>
                      <small>Include mandate hash in metadata.</small>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="agent-card recent-events">
              <h2>Recent Events</h2>
              <div className="events-list">
                {requests.map((request) => (
                  <div className="event-row" key={request.id}>
                    <span>{new Date(request.created_at).toLocaleTimeString()}</span>
                    <span className={request.status === 'denied' ? 'text-error' : 'text-tertiary'}>
                      {request.status === 'denied' ? 'AUTH_DENIED' : 'AUTH_SUCCESS'}
                    </span>
                    <span>${Number(request.amount).toFixed(2)} -> {request.merchant}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="agent-card security-card">
              <div className="security-chart">
                <div className="security-ring">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#222"
                      strokeWidth="1"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#C08532"
                      strokeDasharray="85, 100"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <div>
                    <span>85%</span>
                    <small>Security Score</small>
                  </div>
                </div>
              </div>
              <div className="security-body">
                <h3>Security Overview</h3>
                <p>
                  This agent is operating under a high-security mandate with 2FA required for key rotations and strict
                  merchant whitelisting enforced at the kernel level.
                </p>
                <div className="security-tags">
                  <span>Encrypted</span>
                  <span>Isolated</span>
                  <span>Hardened</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
