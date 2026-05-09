import { useEffect, useState } from 'react';
import type { Page } from '../App';
import { createAgent, createMandate, createOrg } from '../lib/api';
import { getStoredAgentId, getStoredMandateId, getStoredOrgId, setStoredAgentId, setStoredMandateId, setStoredOrgId } from '../lib/storage';
import type { MandateCreate } from '../types/api';

interface Props {
  onNavigate: (page: Page) => void
}

const S: Record<string, React.CSSProperties> = {
  page: { maxWidth: '860px', margin: '0 auto', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' },
  header: { borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' },
  h1: { fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' },
  sub: { fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373', letterSpacing: '0.04em', marginTop: '4px', textTransform: 'uppercase' as const },
  card: { backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  stepNum: { fontFamily: 'Space Grotesk', fontSize: '10px', color: '#C08532', letterSpacing: '0.1em', textTransform: 'uppercase' as const },
  stepTitle: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '2px' },
  stepDesc: { fontFamily: 'Inter', fontSize: '12px', color: '#737373' },
  label: { fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '4px', display: 'block' },
  input: { width: '100%', backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'Space Grotesk', fontSize: '13px', padding: '9px 12px', outline: 'none' },
  btn: { padding: '9px 18px', backgroundColor: '#C08532', color: '#000', border: 'none', fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' },
  btnDisabled: { padding: '9px 18px', backgroundColor: '#1A1A1A', color: '#555', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'not-allowed' },
  badge: { padding: '2px 8px', fontFamily: 'Space Grotesk', fontSize: '10px', borderRadius: '2px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  keyBox: { backgroundColor: '#080808', border: '1px solid rgba(192,133,50,0.3)', padding: '12px', fontFamily: 'Space Grotesk', fontSize: '12px', color: '#C08532', letterSpacing: '0.05em', wordBreak: 'break-all' as const },
  warn: { fontFamily: 'Inter', fontSize: '11px', color: '#514537' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
}

export default function SetupPage({ onNavigate }: Props) {
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
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Setup – AgentPay'; }, []);

  const step1Done = Boolean(orgId);
  const step2Done = Boolean(agentId);
  const step3Done = Boolean(mandateId);

  async function handleCreateOrg() {
    if (!orgName || step1Done) return;
    setLoading('org'); setError('');
    try {
      const org = await createOrg({ name: orgName });
      setOrgId(org.id); setStoredOrgId(org.id); setOrgName('');
    } catch { setError('Failed to create org. Is the API running?'); }
    setLoading('');
  }

  async function handleCreateAgent() {
    if (!orgId || !agentName || step2Done) return;
    setLoading('agent'); setError('');
    try {
      const agent = await createAgent({ org_id: orgId, name: agentName });
      setAgentId(agent.id); setStoredAgentId(agent.id);
      setApiKey(agent.api_key ?? null); setAgentName('');
    } catch { setError('Failed to create agent.'); }
    setLoading('');
  }

  function addMerchant() {
    if (!merchantInput.trim()) return;
    setMerchants(prev => Array.from(new Set([...prev, merchantInput.trim()])));
    setMerchantInput('');
  }

  async function handleCreateMandate() {
    if (!agentId || step3Done) return;
    setLoading('mandate'); setError('');
    try {
      const payload: MandateCreate = { agent_id: agentId, max_per_transaction: Number(maxPer), approval_threshold: Number(budget), allowed_merchants: merchants };
      const mandate = await createMandate(payload);
      setMandateId(mandate.id); setStoredMandateId(mandate.id);
    } catch { setError('Failed to create mandate.'); }
    setLoading('');
  }

  const stepStyle = (done: boolean, locked: boolean): React.CSSProperties => ({
    ...S.card,
    opacity: locked ? 0.45 : 1,
    borderLeft: done ? '2px solid #4ae176' : '2px solid rgba(192,133,50,0.4)',
    pointerEvents: locked ? 'none' : 'auto',
  });

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.h1}>Setup</h1>
        <p style={S.sub}>Initialize org · provision agent · define mandate</p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.2)', padding: '10px 14px', fontFamily: 'Space Grotesk', fontSize: '12px', color: '#ffb4ab' }}>
          {error}
        </div>
      )}

      {/* Step 1 */}
      <div style={stepStyle(step1Done, false)}>
        <div style={S.row}>
          <div>
            <span style={S.stepNum}>01 / Create Org</span>
            <div style={S.stepTitle}>Organization</div>
            <div style={S.stepDesc}>Define the root entity for this deployment.</div>
          </div>
          <span style={{ ...S.badge, backgroundColor: step1Done ? 'rgba(74,225,118,0.1)' : 'rgba(192,133,50,0.1)', color: step1Done ? '#4ae176' : '#C08532', border: `1px solid ${step1Done ? 'rgba(74,225,118,0.2)' : 'rgba(192,133,50,0.2)'}` }}>
            {step1Done ? 'DONE' : 'ACTIVE'}
          </span>
        </div>
        {!step1Done && (
          <div>
            <label style={S.label}>Organization Name</label>
            <input style={S.input} value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Acme Corp Automated Trading"
              onFocus={e => { e.currentTarget.style.borderColor = '#C08532' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            />
            <div style={{ marginTop: '10px' }}>
              <button style={orgName && loading !== 'org' ? S.btn : S.btnDisabled} onClick={handleCreateOrg} disabled={!orgName || loading === 'org'}>
                {loading === 'org' ? 'Creating...' : 'Create Org'}
              </button>
            </div>
          </div>
        )}
        {step1Done && <div style={{ fontFamily: 'Space Grotesk', fontSize: '12px', color: '#4ae176' }}>✓ Org created — ID stored in session</div>}
      </div>

      {/* Step 2 */}
      <div style={stepStyle(step2Done, !step1Done)}>
        <div style={S.row}>
          <div>
            <span style={S.stepNum}>02 / Provision Agent</span>
            <div style={S.stepTitle}>Agent</div>
            <div style={S.stepDesc}>Generate credentials for the autonomous actor.</div>
          </div>
          <span style={{ ...S.badge, backgroundColor: step2Done ? 'rgba(74,225,118,0.1)' : 'rgba(192,133,50,0.1)', color: step2Done ? '#4ae176' : '#C08532', border: `1px solid ${step2Done ? 'rgba(74,225,118,0.2)' : 'rgba(192,133,50,0.2)'}` }}>
            {step2Done ? 'DONE' : step1Done ? 'ACTIVE' : 'LOCKED'}
          </span>
        </div>
        {!step2Done && (
          <div>
            <label style={S.label}>Agent Identifier</label>
            <input style={S.input} value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="trading-bot-alpha-v2"
              onFocus={e => { e.currentTarget.style.borderColor = '#C08532' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            />
            <div style={{ marginTop: '10px' }}>
              <button style={agentName && loading !== 'agent' ? S.btn : S.btnDisabled} onClick={handleCreateAgent} disabled={!agentName || loading === 'agent'}>
                {loading === 'agent' ? 'Creating...' : 'Provision Agent'}
              </button>
            </div>
          </div>
        )}
        {apiKey && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={S.label}>Generated API Key — store this now</label>
            <div style={S.keyBox}>{apiKey}</div>
            <p style={S.warn}>⚠ This will not be shown again.</p>
          </div>
        )}
        {step2Done && !apiKey && <div style={{ fontFamily: 'Space Grotesk', fontSize: '12px', color: '#4ae176' }}>✓ Agent provisioned</div>}
      </div>

      {/* Step 3 */}
      <div style={stepStyle(step3Done, !step2Done)}>
        <div style={S.row}>
          <div>
            <span style={S.stepNum}>03 / Define Mandate</span>
            <div style={S.stepTitle}>Mandate</div>
            <div style={S.stepDesc}>Set spending limits and allowed merchants.</div>
          </div>
          <span style={{ ...S.badge, backgroundColor: step3Done ? 'rgba(74,225,118,0.1)' : 'rgba(192,133,50,0.1)', color: step3Done ? '#4ae176' : '#C08532', border: `1px solid ${step3Done ? 'rgba(74,225,118,0.2)' : 'rgba(192,133,50,0.2)'}` }}>
            {step3Done ? 'DONE' : step2Done ? 'ACTIVE' : 'LOCKED'}
          </span>
        </div>
        {!step3Done && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Transaction Limit ($)</label>
                <input style={S.input} value={maxPer} onChange={e => setMaxPer(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor = '#C08532' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                />
              </div>
              <div>
                <label style={S.label}>Monthly Budget ($)</label>
                <input style={S.input} value={budget} onChange={e => setBudget(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor = '#C08532' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                />
              </div>
            </div>
            <div>
              <label style={S.label}>Allowed Merchants (press Enter to add)</label>
              <input style={S.input} value={merchantInput} onChange={e => setMerchantInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMerchant(); } }}
                placeholder="Stripe, AWS, GitHub..."
                onFocus={e => { e.currentTarget.style.borderColor = '#C08532' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
              />
              {merchants.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {merchants.map(m => (
                    <span key={m} style={{ padding: '3px 10px', backgroundColor: 'rgba(192,133,50,0.1)', border: '1px solid rgba(192,133,50,0.2)', color: '#C08532', fontFamily: 'Space Grotesk', fontSize: '11px', borderRadius: '2px' }}>{m}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <button style={loading !== 'mandate' ? S.btn : S.btnDisabled} onClick={handleCreateMandate} disabled={loading === 'mandate'}>
                {loading === 'mandate' ? 'Saving...' : 'Save Mandate'}
              </button>
            </div>
          </div>
        )}
        {step3Done && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '12px', color: '#4ae176' }}>✓ Mandate active — ready to authorize</div>
            <button style={S.btn} onClick={() => onNavigate('simulator')}>Run Simulator →</button>
          </div>
        )}
      </div>
    </div>
  )
}
