import type { PurchaseRequestRead } from '../types/api';

export default function Dashboard({ requests }: { requests: PurchaseRequestRead[] }) {
  return (
    <div className="dashboard-list">
      {requests.map((r) => (
        <div className="request-row" key={r.id}>
          <div className="req-left">
            <div className="merchant">{r.merchant}</div>
            <div className="meta">{new Date(r.created_at).toLocaleString()}</div>
          </div>
          <div className="req-right">
            <div className="amount">${Number(r.amount).toFixed(2)}</div>
            <div className={`status ${r.status}`}>{r.status.toUpperCase()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
