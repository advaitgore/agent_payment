import { useState } from 'react';
import type { AgentRead, PurchaseRequestCreate, PurchaseEvaluationResponse } from '../types/api';

export default function Simulator({
  agents,
  selectedAgent,
  onSelectAgent,
  onSubmit,
}: {
  agents: AgentRead[];
  selectedAgent: AgentRead | null;
  onSelectAgent: (a: AgentRead) => void;
  onSubmit: (p: PurchaseRequestCreate) => Promise<void>;
}) {
  const [merchant, setMerchant] = useState('Amazon');
  const [amount, setAmount] = useState('100.00');
  const [category, setCategory] = useState('software');
  const [reason, setReason] = useState('Test purchase');

  return (
    <div className="simulator">
      <label>Agent</label>
      <select value={selectedAgent?.id || ''} onChange={(e) => { const id = e.target.value; const a = agents.find(x=>x.id===id); if (a) onSelectAgent(a); }}>
        <option value="">Select agent</option>
        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      <label>Merchant</label>
      <input value={merchant} onChange={(e) => setMerchant(e.target.value)} />

      <label>Amount</label>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} />

      <label>Category</label>
      <input value={category} onChange={(e) => setCategory(e.target.value)} />

      <label>Reason</label>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} />

      <button onClick={() => selectedAgent && onSubmit({ agent_id: selectedAgent.id, merchant, amount: Number(amount), category, reason })}>Submit & Evaluate</button>
    </div>
  );
}

export function DecisionTerminal({ result }: { result: PurchaseEvaluationResponse }) {
  const color = result.decision_status === 'approved' ? 'green' : result.decision_status === 'denied' ? 'red' : 'goldenrod';
  const label = result.decision_status === 'approved' ? 'APPROVED' : result.decision_status === 'denied' ? 'DENIED' : 'NEEDS REVIEW';
  return (
    <div className="terminal" style={{ borderColor: color }}>
      <div className="terminal-label">{label}</div>
      <pre className="code-block">{result.reason}</pre>
    </div>
  );
}
