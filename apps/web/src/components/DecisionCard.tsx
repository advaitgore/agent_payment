import React from 'react';
import type { PurchaseEvaluationResponse } from '../types/api';

interface DecisionCardProps {
  result: PurchaseEvaluationResponse;
}

const statusStyles: Record<string, { bg: string; color: string }> = {
  approved: { bg: '#c8e6c9', color: '#2e7d32' },
  denied: { bg: '#ffcdd2', color: '#c62828' },
  needs_review: { bg: '#fff9c4', color: '#f57f17' },
};

export function DecisionCard({ result }: DecisionCardProps) {
  const style = statusStyles[result.decision_status] || { bg: '#e0e0e0', color: '#333' };

  return (
    <div
      className="decision-card"
      style={{
        maxWidth: '600px',
        margin: '24px auto',
        padding: '20px',
        borderRadius: '8px',
        border: `2px solid ${style.color}`,
        backgroundColor: style.bg,
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontWeight: '600', color: '#666' }}>Request ID:</span>
        <p style={{ margin: '4px 0', fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{result.request_id}</p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontWeight: '600', color: '#666' }}>Decision:</span>
        <p
          style={{
            margin: '4px 0',
            fontSize: '18px',
            fontWeight: '700',
            color: style.color,
            textTransform: 'uppercase',
          }}
        >
          {result.decision_status}
        </p>
      </div>

      <div>
        <span style={{ fontWeight: '600', color: '#666' }}>Reason:</span>
        <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>{result.reason}</p>
      </div>
    </div>
  );
}
