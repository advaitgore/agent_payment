import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import TopBar from '../components/TopBar';
import { listAuditEvents } from '../lib/api';
import { getStoredAgentId } from '../lib/storage';
import type { AuditEventListItem, AuditEventListResponse, DecisionStatus } from '../types/api';

const STATUS_OPTIONS = ['ALL_EVENTS', 'APPROVED', 'DENIED', 'NEEDS_REVIEW'] as const;
const RANGE_OPTIONS = ['LAST_24_HOURS', 'LAST_7_DAYS'] as const;

type StatusOption = typeof STATUS_OPTIONS[number];
type RangeOption = typeof RANGE_OPTIONS[number];

function toDecisionStatus(value: string): DecisionStatus | undefined {
  if (value === 'APPROVED') return 'approved';
  if (value === 'DENIED') return 'denied';
  if (value === 'NEEDS_REVIEW') return 'needs_review';
  return undefined;
}

function truncateTrace(value: string) {
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export default function AuditLogPage() {
  const [statusFilter, setStatusFilter] = useState<StatusOption>('ALL_EVENTS');
  const [rangeFilter, setRangeFilter] = useState<RangeOption>('LAST_24_HOURS');
  const [offset, setOffset] = useState(0);
  const [response, setResponse] = useState<AuditEventListResponse | null>(null);
  const agentId = useMemo(() => getStoredAgentId(), []);

  useEffect(() => {
    document.title = 'Audit Log - AI_PAY_AUTH';
  }, []);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    if (rangeFilter === 'LAST_7_DAYS') {
      start.setDate(now.getDate() - 7);
    } else {
      start.setDate(now.getDate() - 1);
    }

    listAuditEvents({
      agent_id: agentId ?? undefined,
      status: toDecisionStatus(statusFilter),
      start: start.toISOString(),
      end: now.toISOString(),
      limit: 20,
      offset,
    })
      .then(setResponse)
      .catch(() => setResponse({ items: [], total: 0, limit: 20, offset }));
  }, [agentId, offset, rangeFilter, statusFilter]);

  const items = response?.items ?? [];
  const total = response?.total ?? 0;

  return (
    <AppShell>
      <TopBar
        title="Authorization Console"
        showSearch
        searchPlaceholder="SEARCH LOGS..."
        variant="breadcrumb"
      />

      <main className="page-main audit-main">
        <div className="audit-container">
          <section className="audit-filters">
            <div className="audit-filters-left">
              <div className="filter-item">
                <span>Status:</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusOption)}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <span>Range:</span>
                <select value={rangeFilter} onChange={(event) => setRangeFilter(event.target.value as RangeOption)}>
                  {RANGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="audit-filters-right">
              <button type="button">Export CSV</button>
              <button type="button" onClick={() => setOffset(0)}>
                Refresh
              </button>
            </div>
          </section>

          <section className="audit-table">
            <div className="audit-table-scroll scroll-thin">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp (ISO)</th>
                    <th>Action / Event_Type</th>
                    <th>Merchant_ID</th>
                    <th>Amount</th>
                    <th>Decision</th>
                    <th className="text-right">Trace_ID</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: AuditEventListItem) => (
                    <tr key={item.id}>
                      <td>{new Date(item.created_at).toISOString()}</td>
                      <td>
                        <span className="audit-pill">{item.action.toUpperCase()}</span>
                      </td>
                      <td>{item.merchant ?? 'N/A'}</td>
                      <td>{item.amount !== null && item.amount !== undefined ? `$${Number(item.amount).toFixed(2)}` : 'N/A'}</td>
                      <td>
                        {item.decision_status ? (
                          <span className={`decision-badge decision-${item.decision_status}`}>
                            <span className="decision-dot" />
                            {item.decision_status.toUpperCase()}
                          </span>
                        ) : (
                          <span className="decision-badge decision-neutral">
                            <span className="decision-dot" />
                            COMPLETED
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <span className="trace-pill">{truncateTrace(item.trace_id)}</span>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="audit-empty">
                        No audit events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="audit-pagination">
              <div>SHOWING {Math.min(total, offset + 20)} OF {total} EVENTS</div>
              <div className="audit-pagination-actions">
                <button
                  type="button"
                  onClick={() => setOffset(Math.max(0, offset - 20))}
                  disabled={offset === 0}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOffset(offset + 20)}
                  disabled={offset + 20 >= total}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

          <section className="audit-stats">
            <div className="stat-card">
              <div className="stat-label">Auth Success Rate (24h)</div>
              <div className="stat-value">
                <span>99.4%</span>
                <span className="stat-delta stat-good">+0.2%</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Mean Latency</div>
              <div className="stat-value">
                <span>124ms</span>
                <span className="stat-delta stat-bad">+12ms</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Keys</div>
              <div className="stat-value">
                <span>1,842</span>
                <span className="stat-delta">0 delta</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
