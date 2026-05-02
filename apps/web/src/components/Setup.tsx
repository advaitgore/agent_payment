import React, { useState } from 'react';
import type { AgentRead, MandateCreate } from '../types/api';

function CodeBlock({ children }: { children: React.ReactNode }) {
  return <pre className="code-block">{children}</pre>;
}

export default function Setup({
  onCreateOrg,
  onCreateAgent,
  onCreateMandate,
  agents,
}: {
  onCreateOrg: (name: string) => Promise<void>;
  onCreateAgent: (name: string) => Promise<AgentRead | undefined>;
  onCreateMandate: (m: MandateCreate) => Promise<void>;
  agents: AgentRead[];
}) {
  const [orgName, setOrgName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentRead | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [maxPer, setMaxPer] = useState<string>('1000');
  const [threshold, setThreshold] = useState<string>('5000');
  const [merchantInput, setMerchantInput] = useState('');
  const [merchants, setMerchants] = useState<string[]>([]);

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
    }
  }

  function addMerchant(tag: string) {
    if (!tag) return;
    setMerchants((s) => Array.from(new Set([...s, tag])));
    setMerchantInput('');
  }

  async function stepCreateMandate() {
    if (!selectedAgent) return;
    const payload: MandateCreate = {
      agent_id: selectedAgent.id,
      max_per_transaction: Number(maxPer),
      approval_threshold: Number(threshold),
      allowed_merchants: merchants,
    };
    await onCreateMandate(payload);
  }

  return (
    <div>
      <div className="setup-step">
        <label>Step 1 — Create Organization</label>
        <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Organization name" />
        <button onClick={stepCreateOrg}>Create</button>
      </div>

      <div className="setup-step">
        <label>Step 2 — Create Agent</label>
        <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Agent name" />
        <button onClick={stepCreateAgent}>Create Agent</button>
        {apiKey && (
          <div>
            <label>Agent API Key</label>
            <CodeBlock>{apiKey}</CodeBlock>
          </div>
        )}
      </div>

      <div className="setup-step">
        <label>Step 3 — Create Mandate</label>
        <input value={maxPer} onChange={(e) => setMaxPer(e.target.value)} placeholder="Max per transaction" />
        <input value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="Approval threshold" />
        <div className="tag-input">
          <input value={merchantInput} onChange={(e) => setMerchantInput(e.target.value)} placeholder="Type merchant and press Enter" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMerchant(merchantInput); } }} />
          <div className="tags">{merchants.map((m) => <span key={m} className="tag">{m}</span>)}</div>
        </div>
        <button onClick={stepCreateMandate}>Create Mandate</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Agents</label>
        <select onChange={(e) => { const id = e.target.value; const a = agents.find(x=>x.id===id); setSelectedAgent(a || null); }}>
          <option value="">Select agent</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
