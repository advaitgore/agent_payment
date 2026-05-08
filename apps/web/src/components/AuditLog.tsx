import { useEffect, useMemo, useState } from 'react';
import AppShell from './AppShell';
import TopBar from './TopBar';
import { listAuditEvents } from '../lib/api';
import type { AuditEventListItem, AuditEventListResponse } from '../types/api';
import type { AppContext } from '../types/app';

function formatDetails(details: Record<string, unknown>) {
  const pairs = Object.entries(details).map(([key, value]) => {
    const rendered = typeof value === 'string' ? value : JSON.stringify(value);
    return `${key}: ${rendered}`;
  });
  return pairs.join(' · ');
}

export default function AuditLog({ currentAgentId, currentOrgId, currentOrgName, currentPage, onNavigate }: AppContext) {
  const [response, setResponse] = useState<AuditEventListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryAgentId = useMemo(() => currentAgentId ?? undefined, [currentAgentId]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      if (!queryAgentId) {
        setLoading(false);
        setResponse({ items: [], total: 0, limit: 50, offset: 0 });
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await listAuditEvents({ agent_id: queryAgentId, limit: 50, offset: 0 });
        if (!cancelled) {
          setResponse(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load audit events.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEvents();
    const interval = window.setInterval(loadEvents, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [queryAgentId]);

  const items = response?.items ?? [];

  return (
    <AppShell
      currentAgentId={currentAgentId}
      currentOrgId={currentOrgId}
      currentOrgName={currentOrgName}
      currentPage={currentPage}
      onNavigate={onNavigate}
    >
      <TopBar title="Authorization Console" breadcrumb="Audit Log" showSearch={false} />

      <main className="page-main audit-main">
        <div className="audit-container">
          {loading && <div className="audit-loading">Loading audit events...</div>}
          {error && <div className="audit-error">{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div className="audit-empty-state">
              <span className="material-symbols-outlined">history</span>
              <div>No audit events yet</div>
            </div>
          )}

          {items.length > 0 && (
            <div className="audit-table">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Merchant</th>
                    <th>Amount</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: AuditEventListItem) => (
                    <tr key={item.id}>
                      <td>{new Date(item.created_at).toLocaleString()}</td>
                      <td>
                        <span className="audit-pill">{item.action}</span>
                      </td>
                      <td>{item.merchant ?? '—'}</td>
                      <td>{item.amount !== null && item.amount !== undefined ? `$${Number(item.amount).toFixed(2)}` : '—'}</td>
                      <td>
                        <details className="audit-details">
                          <summary>{formatDetails(item.details)}</summary>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
