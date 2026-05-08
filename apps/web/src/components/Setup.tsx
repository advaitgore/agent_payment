import { useMemo, useState } from 'react';
import AppShell from './AppShell';
import TopBar from './TopBar';
import type { AgentRead, MandateCreate } from '../types/api';
import type { AppContext } from '../types/app';

function KeyBox({
  value,
  copied,
  onCopy,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className={`api-key-box ${copied ? 'api-key-box-copied' : ''}`}>
      <div className="api-key-row">
        <span className="api-key-label">Agent API Key</span>
        <button type="button" className="api-key-copy" onClick={onCopy}>
          <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="api-key-value">{value}</pre>
      <div className="api-key-warning">Save this key — you won't be able to see it again</div>
    </div>
  );
}

export default function Setup({
  onCreateOrg,
  onCreateAgent,
  onCreateMandate,
  currentOrgId,
  currentOrgName,
  currentAgentId,
  currentPage,
  onNavigate,
}: {
  onCreateOrg: (name: string) => Promise<void>;
  onCreateAgent: (name: string) => Promise<AgentRead | undefined>;
  onCreateMandate: (m: MandateCreate) => Promise<void>;
} & AppContext) {
  const [orgName, setOrgName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentRead | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [apiKeyAcknowledged, setApiKeyAcknowledged] = useState(false);
  const [maxPer, setMaxPer] = useState<string>('1000');
  const [threshold, setThreshold] = useState<string>('5000');
  const [merchantInput, setMerchantInput] = useState('');
  const [merchants, setMerchants] = useState<string[]>([]);

  const orgComplete = Boolean(currentOrgId);
  const agentComplete = Boolean(currentAgentId || selectedAgent);

  const revealKey = useMemo(() => apiKeyVisible && Boolean(apiKey), [apiKey, apiKeyVisible]);

  async function stepCreateOrg() {
    if (!orgName) return;
    await onCreateOrg(orgName);
    setOrgName('');
  }

  async function stepCreateAgent() {
    if (!agentName) return;
    const a = await onCreateAgent(agentName);
    setAgentName('');
    if (a) {
      setSelectedAgent(a);
      setApiKey(a.api_key || null);
      setApiKeyVisible(false);
      setApiKeyCopied(false);
      setApiKeyAcknowledged(false);
    }
  }

  function addMerchant(tag: string) {
    if (!tag) return;
    setMerchants((s) => Array.from(new Set([...s, tag])));
    setMerchantInput('');
  }

  async function stepCreateMandate() {
    const targetAgentId = selectedAgent?.id ?? currentAgentId;
    if (!targetAgentId) return;
    const payload: MandateCreate = {
      agent_id: targetAgentId,
      max_per_transaction: Number(maxPer),
      approval_threshold: Number(threshold),
      allowed_merchants: merchants,
    };
    await onCreateMandate(payload);
  }

  async function copyApiKey() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    window.setTimeout(() => setApiKeyCopied(false), 1500);
  }

  return (
    <AppShell currentAgentId={currentAgentId} currentOrgId={currentOrgId} currentOrgName={currentOrgName} currentPage={currentPage} onNavigate={onNavigate}>
      <TopBar title="Authorization Console" />
      <main className="page-main setup-main">
        <div className="setup-step setup-card">
          <label>Step 1 — Create Organization</label>
          <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Organization name" />
          <button onClick={stepCreateOrg} disabled={orgComplete}>
            {orgComplete ? 'Created' : 'Create'}
          </button>
        </div>

        <div className="setup-step setup-card">
          <label>Step 2 — Create Agent</label>
          <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Agent name" />
          <button onClick={stepCreateAgent} disabled={!orgComplete || agentComplete}>
            {agentComplete ? 'Created' : 'Create Agent'}
          </button>
          {apiKey && (
            <div className="api-key-wrap">
              <div className="api-key-reveal-bar">
                <button type="button" className="api-key-toggle" onClick={() => setApiKeyVisible((value) => !value)}>
                  <span className="material-symbols-outlined">{revealKey ? 'visibility_off' : 'visibility'}</span>
                  {revealKey ? 'Hide Key' : 'Reveal Key'}
                </button>
              </div>
              <KeyBox value={revealKey ? apiKey : '••••••••••••••••••••••••••••••••'} copied={apiKeyCopied} onCopy={copyApiKey} />
              <button
                type="button"
                className="acknowledge-button"
                onClick={() => setApiKeyAcknowledged(true)}
              >
                I saved this key
              </button>
            </div>
          )}
        </div>

        <div className={`setup-step setup-card ${apiKeyAcknowledged ? '' : 'setup-card-disabled'}`}>
          <label>Step 3 — Create Mandate</label>
          <input value={maxPer} onChange={(e) => setMaxPer(e.target.value)} placeholder="Max per transaction" />
          <input value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="Approval threshold" />
          <div className="tag-input">
            <input value={merchantInput} onChange={(e) => setMerchantInput(e.target.value)} placeholder="Type merchant and press Enter" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMerchant(merchantInput); } }} />
            <div className="tags">{merchants.map((m) => <span key={m} className="tag">{m}</span>)}</div>
          </div>
          <button onClick={stepCreateMandate} disabled={!apiKeyAcknowledged || (!selectedAgent && !currentAgentId)}>
            Create Mandate
          </button>
        </div>
      </main>
    </AppShell>
  );
}
