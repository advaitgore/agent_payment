import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import { getMandate, getSpendingSummary, updateMandate } from '../lib/api';
import { setStoredMandateId } from '../lib/storage';
import type { MandateRead } from '../types/api';

export default function MandateEditorPage() {
  const { mandateId } = useParams();
  const [mandate, setMandate] = useState<MandateRead | null>(null);
  const [maxPer, setMaxPer] = useState('500.00');
  const [budget, setBudget] = useState('15000.00');
  const [merchants, setMerchants] = useState<string[]>([]);
  const [merchantInput, setMerchantInput] = useState('');
  const [remaining, setRemaining] = useState<string>('0.00');
  const [spentTotal, setSpentTotal] = useState(0);

  const resolvedId = useMemo(() => mandateId ?? '', [mandateId]);

  useEffect(() => {
    document.title = 'Mandate Editor - AI_PAY_AUTH';
  }, []);

  useEffect(() => {
    if (!resolvedId) return;
    setStoredMandateId(resolvedId);
    getMandate(resolvedId)
      .then((data) => {
        setMandate(data);
        setMaxPer(String(data.max_per_transaction));
        setBudget(String(data.approval_threshold));
        setMerchants(data.allowed_merchants ?? []);
        return getSpendingSummary(data.agent_id);
      })
      .then((summary) => {
        const totalSpent = Number(summary.total_spent || 0);
        setSpentTotal(totalSpent);
      })
      .catch(() => {
        setMandate(null);
      });
  }, [resolvedId]);

  useEffect(() => {
    const parsedBudget = Number(budget || 0);
    const remainingValue = parsedBudget - spentTotal;
    setRemaining(remainingValue.toFixed(2));
  }, [budget, spentTotal]);

  function addMerchant() {
    if (!merchantInput.trim()) return;
    setMerchants((prev) => Array.from(new Set([...prev, merchantInput.trim()])));
    setMerchantInput('');
  }

  function removeMerchant(value: string) {
    setMerchants((prev) => prev.filter((item) => item !== value));
  }

  async function handleSave() {
    if (!mandate) return;
    const updated = await updateMandate(mandate.id, {
      max_per_transaction: Number(maxPer),
      approval_threshold: Number(budget),
      allowed_merchants: merchants,
    });
    setMandate(updated);
  }

  return (
    <AppShell>
      <TopBar title="Authorization Console" breadcrumb="Mandate Editor" showSearch searchPlaceholder="SEARCH_SYSTEM..." />

      <main className="page-main mandate-main">
        <div className="mandate-container">
          <div className="mandate-header">
            <div className="mandate-badge">LIVE_AGENT</div>
            <h1 className="font-h1">{mandate?.agent_id ?? 'trading-bot-alpha-v2'}</h1>
            <p className="text-muted">
              Modify the operational parameters and spending constraints for the autonomous trading unit. All changes are
              logged to the audit chain immediately upon confirmation.
            </p>
          </div>

          <div className="mandate-card">
            <div className="mandate-card-header">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              <h2>Financial Constraints</h2>
            </div>
            <div className="mandate-grid">
              <div>
                <label>Monthly Budget (USD)</label>
                <div className="input-money">
                  <span>$</span>
                  <input value={budget} onChange={(event) => setBudget(event.target.value)} type="number" />
                </div>
                <p className="hint">Remaining for this cycle: ${remaining}</p>
              </div>
              <div>
                <label>Per Transaction Limit</label>
                <div className="input-money">
                  <span>$</span>
                  <input value={maxPer} onChange={(event) => setMaxPer(event.target.value)} type="number" />
                </div>
                <p className="hint">Hard cap enforced by system kernel.</p>
              </div>
            </div>
          </div>

          <div className="mandate-card">
            <div className="mandate-card-header">
              <span className="material-symbols-outlined">verified_user</span>
              <h2>Allowed Merchants</h2>
            </div>
            <div className="merchant-editor">
              <div className="merchant-list">
                {merchants.map((merchant) => (
                  <div className="merchant-chip" key={merchant}>
                    <span>{merchant}</span>
                    <button type="button" onClick={() => removeMerchant(merchant)}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
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
                  placeholder="Add Merchant ID..."
                />
              </div>
              <div className="merchant-toggle">
                <input type="checkbox" defaultChecked />
                <label>Restrict to US-based Entities Only</label>
              </div>
            </div>
          </div>

          <div className="mandate-meta">
            <div>
              <span>Mandate_ID:</span>
              <span className="mandate-id">{mandate?.id ?? 'MN-992-X-V2-ALPH'}</span>
            </div>
            <div>Last Sync: {mandate?.updated_at ?? mandate?.created_at ?? '2023-11-24 14:32:01 UTC'}</div>
          </div>

          <div className="mandate-actions">
            <button type="button" className="btn-secondary">
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>

          <div className="mandate-risk">
            <div className="risk-card">
              <div className="risk-icon">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div>
                <h4>Exposure Projection</h4>
                <p>
                  Current settings represent a 12.5% increase in liquidity exposure compared to previous mandate v1.9.
                  Risk engine indicates 'Stable' status.
                </p>
              </div>
            </div>
            <div className="risk-score">
              <span>98.2%</span>
              <span>Auth Success Rate</span>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
