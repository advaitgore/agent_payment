import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import { getSpendingSummary, listRequests } from '../lib/api';
import { getStoredAgentId } from '../lib/storage';
import type { PurchaseRequestRead, SpendingSummary } from '../types/api';

function shortId(value: string) {
  return value.replace(/-/g, '').slice(0, 6).toUpperCase();
}

function formatStatus(status: string) {
  if (status === 'needs_review') return 'Review';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status: string) {
  if (status === 'approved') return 'status-approved';
  if (status === 'denied') return 'status-denied';
  return 'status-review';
}

function iconForMerchant(merchant: string) {
  const normalized = merchant.toLowerCase();
  if (normalized.includes('api')) return 'api';
  if (normalized.includes('cloud')) return 'language';
  if (normalized.includes('stripe')) return 'api';
  if (normalized.includes('unknown')) return 'warning';
  if (normalized.includes('store')) return 'storefront';
  return 'shopping_cart';
}

export default function DashboardPage() {
  const [spending, setSpending] = useState<SpendingSummary | null>(null);
  const [requests, setRequests] = useState<PurchaseRequestRead[]>([]);
  const agentId = useMemo(() => getStoredAgentId(), []);

  useEffect(() => {
    document.title = 'Dashboard - AI_PAY_AUTH';
  }, []);

  useEffect(() => {
    if (!agentId) return;
    getSpendingSummary(agentId).then(setSpending).catch(() => setSpending(null));
    listRequests(agentId).then(setRequests).catch(() => setRequests([]));
  }, [agentId]);

  return (
    <AppShell>
      <TopBar
        title="Authorization Console"
        showSearch
        searchPlaceholder="Search ID, Hash, or Entity"
      />

      <main className="page-main dashboard-main">
        <div className="dashboard-kpis">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Total Requests</span>
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div className="kpi-value">{spending ? spending.total_requests : '0'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Approved</span>
              <span className="material-symbols-outlined kpi-icon-approved">check_circle</span>
            </div>
            <div className="kpi-value">{spending ? spending.approved : '0'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Denied</span>
              <span className="material-symbols-outlined kpi-icon-denied">block</span>
            </div>
            <div className="kpi-value">{spending ? spending.denied : '0'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Needs Review</span>
              <span className="material-symbols-outlined kpi-icon-review">pending_actions</span>
            </div>
            <div className="kpi-value">{spending ? spending.needs_review : '0'}</div>
          </div>
        </div>

        <div className="dashboard-section-header">
          <h2 className="font-h2">Recent Requests</h2>
          <button className="link-button">
            View All <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        <div className="requests-table">
          <div className="requests-table-head">
            <div>Merchant / Entity</div>
            <div className="text-right">Amount</div>
            <div className="text-center">Status</div>
            <div className="text-right">Time</div>
          </div>
          <div className="requests-table-body">
            {requests.length === 0 && (
              <div className="requests-empty">No requests yet.</div>
            )}
            {requests.map((request) => (
              <div className="requests-row" key={request.id}>
                <div className="requests-merchant">
                  <div className="requests-icon">
                    <span className="material-symbols-outlined">{iconForMerchant(request.merchant)}</span>
                  </div>
                  <div>
                    <div className="requests-name">{request.merchant}</div>
                    <div className="requests-code">REQ-{shortId(request.id)}</div>
                  </div>
                </div>
                <div className="requests-amount">${Number(request.amount).toFixed(2)}</div>
                <div className="requests-status">
                  <span className={`status-pill ${statusClass(request.status)}`}>
                    {formatStatus(request.status)}
                  </span>
                </div>
                <div className="requests-time">
                  {new Date(request.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
