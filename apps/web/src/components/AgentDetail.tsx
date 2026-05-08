import { useEffect, useMemo, useState } from 'react';
import AppShell from './AppShell';
import TopBar from './TopBar';
import { getAgent, listMandates, rotateAgentKey, updateMandate } from '../lib/api';
import type { AgentRead, MandateRead } from '../types/api';
import type { AppContext } from '../types/app';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default function AgentDetail({ currentAgentId, currentOrgId, currentOrgName, currentPage, onNavigate }: AppContext) {
  const [agent, setAgent] = useState<AgentRead | null>(null);
  const [mandate, setMandate] = useState<MandateRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [rotateConfirm, setRotateConfirm] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [editingMandate, setEditingMandate] = useState(false);
  const [savingMandate, setSavingMandate] = useState(false);
  const [mandateError, setMandateError] = useState<string | null>(null);
  const [form, setForm] = useState({
    max_per_transaction: '',
    approval_threshold: '',
    allowed_merchants: [] as string[],
  });
  const [merchantInput, setMerchantInput] = useState('');

  const mandateId = mandate?.id ?? null;

  useEffect(() => {
    if (!currentAgentId) {
      setLoading(false);
      setAgent(null);
      setMandate(null);
      setError('No agent selected.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setMandateError(null);
    Promise.all([getAgent(currentAgentId), listMandates(currentAgentId)])
      .then(([agentData, mandates]) => {
        if (cancelled) return;
        setAgent(agentData);
        const firstMandate = mandates[0] ?? null;
        setMandate(firstMandate);
        if (firstMandate) {
          setForm({
            max_per_transaction: String(firstMandate.max_per_transaction),
            approval_threshold: String(firstMandate.approval_threshold),
            allowed_merchants: [...firstMandate.allowed_merchants],
          });
        } else {
          setForm({
            max_per_transaction: '',
            approval_threshold: '',
            allowed_merchants: [],
          });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load agent.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentAgentId]);

  const savedMerchantTags = useMemo(() => form.allowed_merchants, [form.allowed_merchants]);

  function addMerchant() {
    const merchant = merchantInput.trim();
    if (!merchant) return;
    setForm((prev) => ({
      ...prev,
      allowed_merchants: Array.from(new Set([...prev.allowed_merchants, merchant])),
    }));
    setMerchantInput('');
  }

  function removeMerchant(merchant: string) {
    setForm((prev) => ({
      ...prev,
      allowed_merchants: prev.allowed_merchants.filter((item) => item !== merchant),
    }));
  }

  async function handleCopyKey() {
    if (!agent?.api_key) return;
    await navigator.clipboard.writeText(agent.api_key);
    setCopyState('copied');
    window.setTimeout(() => setCopyState('idle'), 1200);
  }

  async function handleRotateKey() {
    if (!currentAgentId) return;
    setRotating(true);
    try {
      const updatedAgent = await rotateAgentKey(currentAgentId);
      setAgent(updatedAgent);
      setShowKey(false);
      setRotateConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rotate key.');
    } finally {
      setRotating(false);
    }
  }

  async function handleSaveMandate() {
    if (!mandateId) return;
    setSavingMandate(true);
    setMandateError(null);
    try {
      const updated = await updateMandate(mandateId, {
        max_per_transaction: Number(form.max_per_transaction),
        approval_threshold: Number(form.approval_threshold),
        allowed_merchants: form.allowed_merchants,
      });
      setMandate(updated);
      setEditingMandate(false);
    } catch (err) {
      setMandateError(err instanceof Error ? err.message : 'Failed to update mandate.');
    } finally {
      setSavingMandate(false);
    }
  }

  return (
    <AppShell
      currentAgentId={currentAgentId}
      currentOrgId={currentOrgId}
      currentOrgName={currentOrgName}
      currentPage={currentPage}
      onNavigate={onNavigate}
    >
      <TopBar title="Authorization Console" breadcrumb="Agent" showSearch={false} />

      <main className="page-main agent-main">
        <div className="agent-container">
          {loading && <div className="agent-loading">Loading agent details...</div>}
          {error && <div className="agent-error">{error}</div>}

          {agent && (
            <>
              <div className="agent-header">
                <div>
                  <div className="agent-title-row">
                    <h1 className="font-h1">{agent.name}</h1>
                    <span className="agent-status">ACTIVE</span>
                  </div>
                  <p className="agent-id">AGENT_ID: {agent.id}</p>
                  <p className="agent-meta">Created {formatDateTime(agent.created_at)}</p>
                </div>
                <div className="agent-actions">
                  <button className="btn-secondary" type="button" onClick={() => setEditingMandate((value) => !value)}>
                    Edit Mandate
                  </button>
                  {rotateConfirm ? (
                    <div className="rotate-confirm">
                      <div>Are you sure? This will invalidate the current key.</div>
                      <div className="rotate-confirm-actions">
                        <button className="btn-secondary" type="button" onClick={() => setRotateConfirm(false)}>
                          Cancel
                        </button>
                        <button className="btn-primary" type="button" onClick={handleRotateKey} disabled={rotating}>
                          {rotating ? 'Rotating...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-primary" type="button" onClick={() => setRotateConfirm(true)}>
                      Rotate API Key
                    </button>
                  )}
                </div>
              </div>

              <div className="agent-grid">
                <section className="agent-card key-card">
                  <div className="card-header">
                    <h2>API Key Management</h2>
                    <span className="card-meta">Created: {formatDateTime(agent.created_at)}</span>
                  </div>
                  <div className="card-body">
                    <label>SECRET_KEY</label>
                    <div className="key-row">
                      <div className="key-value">
                        <span className="key-mask">{showKey ? agent.api_key ?? '' : '••••••••••••••••••••••••••••••••'}</span>
                        <button type="button" onClick={() => setShowKey((value) => !value)}>
                          <span className="material-symbols-outlined">{showKey ? 'visibility_off' : 'visibility'}</span>
                          {showKey ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <button className="icon-button" type="button" onClick={handleCopyKey}>
                        <span className="material-symbols-outlined">{copyState === 'copied' ? 'check' : 'content_copy'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="card-footer">
                    <p>Rotating your key will immediately invalidate the existing token. All active sessions will terminate.</p>
                  </div>
                </section>

                <section className="agent-card mandate-summary">
                  <div className="card-header">
                    <h2>Mandate</h2>
                    <span className="material-symbols-outlined">lock</span>
                  </div>

                  {mandate ? (
                    <>
                      {!editingMandate && (
                        <div className="mandate-summary-grid">
                          <div className="summary-block">
                            <div className="summary-title">Max Per Transaction</div>
                            <div className="summary-card">
                              <strong>${Number(mandate.max_per_transaction).toFixed(2)}</strong>
                            </div>
                          </div>
                          <div className="summary-block">
                            <div className="summary-title">Approval Threshold</div>
                            <div className="summary-card">
                              <strong>${Number(mandate.approval_threshold).toFixed(2)}</strong>
                            </div>
                          </div>
                          <div className="summary-block">
                            <div className="summary-title">Allowed Merchants</div>
                            <div className="summary-list">
                              {mandate.allowed_merchants.map((merchant) => (
                                <span key={merchant} className="merchant-chip">
                                  {merchant}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {editingMandate && (
                        <div className="mandate-editor">
                          <div className="mandate-grid">
                            <div>
                              <label>Max Per Transaction</label>
                              <input
                                type="number"
                                value={form.max_per_transaction}
                                onChange={(event) => setForm((prev) => ({ ...prev, max_per_transaction: event.target.value }))}
                              />
                            </div>
                            <div>
                              <label>Approval Threshold</label>
                              <input
                                type="number"
                                value={form.approval_threshold}
                                onChange={(event) => setForm((prev) => ({ ...prev, approval_threshold: event.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="merchant-editor">
                            <label>Allowed Merchants</label>
                            <div className="merchant-list">
                              {savedMerchantTags.map((merchant) => (
                                <button key={merchant} type="button" className="merchant-chip" onClick={() => removeMerchant(merchant)}>
                                  {merchant}
                                  <span className="material-symbols-outlined">close</span>
                                </button>
                              ))}
                              <input
                                value={merchantInput}
                                onChange={(event) => setMerchantInput(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    addMerchant();
                                  }
                                }}
                                placeholder="Add merchant"
                              />
                            </div>
                          </div>

                          {mandateError && <div className="agent-error">{mandateError}</div>}
                          <div className="mandate-actions">
                            <button className="btn-secondary" type="button" onClick={() => setEditingMandate(false)}>
                              Cancel
                            </button>
                            <button className="btn-primary" type="button" onClick={handleSaveMandate} disabled={savingMandate}>
                              {savingMandate ? 'Saving...' : 'Save Mandate'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="agent-empty">No mandate configured for this agent.</div>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </AppShell>
  );
}
