import { useEffect, useMemo, useState } from 'react';
import AppShell from './AppShell';
import TopBar from './TopBar';
import type { PurchaseRequestRead } from '../types/api';
import type { AppContext } from '../types/app';

function formatStatus(status: PurchaseRequestRead['status']) {
  if (status === 'needs_review') return 'Needs Review';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status: PurchaseRequestRead['status']) {
  if (status === 'approved') return 'status-approved';
  if (status === 'denied') return 'status-denied';
  return 'status-review';
}

function relativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export default function Dashboard({
  requests,
  loading = false,
  error = null,
  currentOrgId,
  currentOrgName,
  currentAgentId,
  currentPage,
  onNavigate,
}: {
  requests: PurchaseRequestRead[];
  loading?: boolean;
  error?: string | null;
} & AppContext) {
  const totals = useMemo(() => {
    const approved = requests.filter((request) => request.status === 'approved').length;
    const denied = requests.filter((request) => request.status === 'denied').length;
    const needsReview = requests.filter((request) => request.status === 'needs_review').length;
    return {
      total: requests.length,
      approved,
      denied,
      needsReview,
    };
  }, [requests]);

  const [displayCounts, setDisplayCounts] = useState(totals);

  useEffect(() => {
    const duration = 700;
    const startedAt = performance.now();
    let rafId = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayCounts({
        total: Math.round(totals.total * ease),
        approved: Math.round(totals.approved * ease),
        denied: Math.round(totals.denied * ease),
        needsReview: Math.round(totals.needsReview * ease),
      });
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    setDisplayCounts({ total: 0, approved: 0, denied: 0, needsReview: 0 });
    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [totals.approved, totals.denied, totals.needsReview, totals.total]);

  return (
    <AppShell currentAgentId={currentAgentId} currentOrgId={currentOrgId} currentOrgName={currentOrgName} currentPage={currentPage} onNavigate={onNavigate}>
      <TopBar title="Authorization Console" showSearch searchPlaceholder="Search ID, Hash, or Entity" />
      <main className="page-main dashboard-main">
        <div className="dashboard-list">
          <div className="dashboard-kpis">
            <div className="kpi-card">
              <div className="kpi-label">Total Requests</div>
              <div className="kpi-value">{displayCounts.total}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label kpi-approved">Approved</div>
              <div className="kpi-value kpi-approved">{displayCounts.approved}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label kpi-denied">Denied</div>
              <div className="kpi-value kpi-denied">{displayCounts.denied}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label kpi-review">Needs Review</div>
              <div className="kpi-value kpi-review">{displayCounts.needsReview}</div>
            </div>
          </div>

          {loading && <div className="dashboard-empty">Loading request ledger...</div>}
          {error && <div className="dashboard-error">{error}</div>}

          {requests.map((r) => (
            <div className="request-row" key={r.id}>
              <div className="req-left">
                <div className="merchant">{r.merchant}</div>
                <div className="meta">{relativeTime(r.created_at)}</div>
              </div>
              <div className="req-right">
                <div className="amount">${Number(r.amount).toFixed(2)}</div>
                <div className={`status ${statusClass(r.status)}`}>{formatStatus(r.status)}</div>
              </div>
            </div>
          ))}

          {!loading && !error && requests.length === 0 && <div className="dashboard-empty">No requests yet.</div>}
        </div>
      </main>
    </AppShell>
  );
}
