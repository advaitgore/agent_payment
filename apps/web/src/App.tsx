import React, { useState } from 'react';
import type { PurchaseEvaluationResponse } from './types/api';
import { PurchaseRequestForm } from './components/PurchaseRequestForm';
import { DecisionCard } from './components/DecisionCard';
import './App.css';

function App() {
  const [evaluation, setEvaluation] = useState<PurchaseEvaluationResponse | null>(null);

  return (
    <div className="app" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingTop: '40px', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingLeft: '16px', paddingRight: '16px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700', color: '#1976d2' }}>Agent Payment</h1>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Submit and evaluate purchase requests</p>
        </header>

        <section style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '600', color: '#333' }}>Submit Purchase Request</h2>
          <PurchaseRequestForm onEvaluationComplete={setEvaluation} />
        </section>

        {evaluation && (
          <section>
            <h2 style={{ marginTop: '40px', marginBottom: '24px', fontSize: '20px', fontWeight: '600', color: '#333', textAlign: 'center' }}>
              Evaluation Result
            </h2>
            <DecisionCard result={evaluation} />
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
