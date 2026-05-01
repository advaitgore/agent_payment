import React, { useState } from 'react';
import type { PurchaseEvaluationResponse } from '../types/api';
import { createPurchaseRequest, evaluatePurchaseRequest } from '../lib/api';

interface PurchaseRequestFormProps {
  onEvaluationComplete: (result: PurchaseEvaluationResponse) => void;
}

export function PurchaseRequestForm({ onEvaluationComplete }: PurchaseRequestFormProps) {
  const [agentId, setAgentId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the purchase request
      const created = await createPurchaseRequest({
        agent_id: agentId,
        merchant,
        amount: parseFloat(amount),
        category,
        reason,
      });

      // Evaluate the request
      const result = await evaluatePurchaseRequest(created.id);
      onEvaluationComplete(result);

      // Clear form
      setAgentId('');
      setMerchant('');
      setAmount('');
      setCategory('');
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="purchase-request-form" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label htmlFor="agent_id">Agent ID</label>
        <input
          id="agent_id"
          type="text"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          required
          placeholder="Enter agent ID (UUID)"
          style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label htmlFor="merchant">Merchant</label>
        <input
          id="merchant"
          type="text"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          required
          placeholder="Enter merchant name"
          style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="0.00"
          style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label htmlFor="category">Category</label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          placeholder="Enter category"
          style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label htmlFor="reason">Reason</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          placeholder="Enter reason for purchase"
          style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
        />
      </div>

      {error && <div style={{ color: '#d32f2f', marginBottom: '16px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          fontSize: '16px',
          fontWeight: '600',
        }}
      >
        {loading ? 'Submitting...' : 'Submit Purchase Request'}
      </button>
    </form>
  );
}
