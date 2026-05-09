import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import { createAgent, createMandate, createOrg } from '../lib/api';
import { getStoredAgentId, getStoredMandateId, getStoredOrgId, setStoredAgentId, setStoredMandateId, setStoredOrgId } from '../lib/storage';
import type { MandateCreate } from '../types/api';
import type { Page } from '../App';

interface Props {
  onNavigate: (page: Page) => void
}

export default function SetupPage({ onNavigate: _onNavigate }: Props) {
  const [orgName, setOrgName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [maxPer, setMaxPer] = useState('500.00');
  const [budget, setBudget] = useState('15000.00');
  const [merchantInput, setMerchantInput] = useState('');
  const [merchants, setMerchants] = useState<string[]>([]);

  const [orgId, setOrgId] = useState<string | null>(getStoredOrgId());
  const [agentId, setAgentId] = useState<string | null>(getStoredAgentId());
  const [mandateId, setMandateId] = useState<string | null>(getStoredMandateId());

  useEffect(() => {
    document.title = 'Setup - AI Agent Payment Authorization';
  }, []);

  async function handleCreateOrg() {
    if (!orgName) return;
    const org = await createOrg({ name: orgName });
    setOrgId(org.id);
    setStoredOrgId(org.id);
    setOrgName('');
  }

  async function handleCreateAgent() {
    if (!orgId || !agentName) return;
    const agent = await createAgent({ org_id: orgId, name: agentName });
    setAgentId(agent.id);
    setStoredAgentId(agent.id);
    setApiKey(agent.api_key ?? null);
    setAgentName('');
  }

  function addMerchant() {
    if (!merchantInput.trim()) return;
    setMerchants((prev) => Array.from(new Set([...prev, merchantInput.trim()])));
    setMerchantInput('');
  }

  async function handleCreateMandate() {
    if (!agentId) return;
    const payload: MandateCreate = {
      agent_id: agentId,
      max_per_transaction: Number(maxPer),
      approval_threshold: Number(budget),
      allowed_merchants: merchants,
    };
    const mandate = await createMandate(payload);
    setMandateId(mandate.id);
    setStoredMandateId(mandate.id);
  }

  const step1Done = Boolean(orgId);
  const step2Done = Boolean(agentId);
  const step3Done = Boolean(mandateId);

  return (
    <AppShell>
      <TopBar title="Authorization Console" />

      <main className="page-main setup-main">
        <div className="setup-header">
          <h1 className="font-h2">Initialize Authorization Flow</h1>
          <p className="text-muted">
            Configure organization details, provision a new agent, and define transaction mandates to secure automated
            payments.
          </p>
        </div>

        <div className="setup-stepper">
          <div className={`step-block ${step1Done ? 'step-complete' : 'step-active'}`}>
            <div className="step-line step-line-active" />
            <div className="step-indicator">
              <span className="material-symbols-outlined">{step1Done ? 'check' : 'radio_button_checked'}</span>
            </div>
            <div className="step-card">
              <div className="step-card-header">
                <div>
                  <div className="step-title">
                    <span className="step-index">01.</span> Create Org
                  </div>
                  <p className="step-subtitle">Define the root entity for this deployment.</p>
                </div>
                <span className={`step-badge ${step1Done ? 'badge-complete' : 'badge-active'}`}>
                  {step1Done ? 'Configured' : 'In Progress'}
                </span>
              </div>
              <div className={`step-body ${step1Done ? 'step-disabled' : ''}`}>
                <label>Organization Name</label>
                <input
                  disabled={step1Done}
                  value={orgName}
                  onChange={(event) => setOrgName(event.target.value)}
                  placeholder="Acme Corp Automated Trading"
                />
                <button onClick={handleCreateOrg} disabled={step1Done || !orgName}>
                  Create Org
                </button>
              </div>
            </div>
          </div>

          <div className={`step-block ${step2Done ? 'step-complete' : step1Done ? 'step-active' : 'step-locked'}`}>
            <div className="step-line" />
            <div className="step-indicator">
              <span className="material-symbols-outlined">{step2Done ? 'check' : 'radio_button_checked'}</span>
            </div>
            <div className={`step-card ${step1Done ? 'step-card-active' : 'step-card-locked'}`}>
              <div className="step-card-header">
                <div>
                  <div className="step-title">
                    <span className="step-index">02.</span> Provision Agent
                  </div>
                  <p className="step-subtitle">Generate credentials for the autonomous actor.</p>
                </div>
                <span className={`step-badge ${step2Done ? 'badge-complete' : 'badge-active'}`}>
                  {step2Done ? 'Configured' : 'In Progress'}
                </span>
              </div>
              <div className={`step-body ${step1Done ? '' : 'step-disabled'}`}>
                <label>Agent Identifier</label>
                <input
                  disabled={!step1Done || step2Done}
                  value={agentName}
                  onChange={(event) => setAgentName(event.target.value)}
                  placeholder="trading-bot-alpha-v2"
                />
                {apiKey && (
                  <div className="api-key-panel">
                    <div className="api-key-header">
                      <span>
                        <span className="material-symbols-outlined">key</span> Generated API Key
                      </span>
                      <button type="button" className="icon-button">
                        <span className="material-symbols-outlined">content_copy</span>
                      </button>
                    </div>
                    <div className="api-key-value font-jetbrains">{apiKey}</div>
                    <p className="api-key-warning">
                      <span className="material-symbols-outlined">warning</span>
                      Store this securely. It will not be shown again.
                    </p>
                  </div>
                )}
                <div className="step-actions">
                  <button onClick={handleCreateAgent} disabled={!step1Done || step2Done || !agentName}>
                    Confirm & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`step-block ${step3Done ? 'step-complete' : step2Done ? 'step-active' : 'step-locked'}`}>
            <div className="step-indicator step-indicator-locked">
              <span>{step3Done ? 'check' : '3'}</span>
            </div>
            <div className={`step-card ${step2Done ? '' : 'step-card-locked'}`}>
              <div className="step-card-header">
                <div>
                  <div className="step-title">
                    <span className="step-index">03.</span> Define Mandate
                  </div>
                  <p className="step-subtitle">Set spending limits and allowed merchants.</p>
                </div>
                <span className="step-lock">
                  <span className="material-symbols-outlined">lock</span>
                </span>
              </div>
              <div className={`step-body ${step2Done ? '' : 'step-disabled'}`}>
                <label>Allowed Merchants</label>
                <div className="merchant-tags">
                  {merchants.length === 0 && <span className="merchant-empty">Awaiting input...</span>}
                  {merchants.map((merchant) => (
                    <span className="merchant-tag" key={merchant}>
                      {merchant}
                    </span>
                  ))}
                  <input
                    disabled={!step2Done}
                    value={merchantInput}
                    onChange={(event) => setMerchantInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addMerchant();
                      }
                    }}
                    placeholder="Add Merchant ID..."
                  />
                </div>
                <div className="mandate-grid">
                  <div>
                    <label>Transaction Limit</label>
                    <div className="input-money">
                      <span>$</span>
                      <input
                        disabled={!step2Done}
                        value={maxPer}
                        onChange={(event) => setMaxPer(event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label>Monthly Budget</label>
                    <div className="input-money">
                      <span>$</span>
                      <input
                        disabled={!step2Done}
                        value={budget}
                        onChange={(event) => setBudget(event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <div className="step-actions">
                  <button onClick={handleCreateMandate} disabled={!step2Done || step3Done}>
                    Save Mandate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
