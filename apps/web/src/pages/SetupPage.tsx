import { useEffect, useState } from 'react'
import type { Page } from '../App'
import { createAgent, createMandate, createOrg } from '../lib/api'
import { getStoredAgentId, getStoredMandateId, getStoredOrgId, getStoredOrgName, setStoredAgentId, setStoredMandateId, setStoredOrgId, setStoredOrgName } from '../lib/storage'

interface Props {
  onNavigate?: (page: Page) => void
}

export default function SetupPage({ onNavigate: _onNavigate }: Props) {
  const [orgId, setOrgId] = useState<string | null>(getStoredOrgId())
  const [agentId, setAgentId] = useState<string | null>(getStoredAgentId())
  const [mandateId, setMandateId] = useState<string | null>(getStoredMandateId())
  const [orgName, setOrgName] = useState(getStoredOrgName() ?? '')
  const [agentName, setAgentName] = useState('')
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [maxPer, setMaxPer] = useState('500.00')
  const [budget, setBudget] = useState('15000.00')
  const [merchantInput, setMerchantInput] = useState('')
  const [merchants, setMerchants] = useState<string[]>([])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState<'org' | 'agent' | 'mandate' | null>(null)

  useEffect(() => {
    document.title = 'Setup - AI_PAY_AUTH'
  }, [])

  const step1Done = Boolean(orgId)
  const step2Done = Boolean(agentId)
  const step3Done = Boolean(mandateId)

  function addMerchant() {
    if (!merchantInput.trim()) return
    setMerchants((prev) => Array.from(new Set([...prev, merchantInput.trim()])))
    setMerchantInput('')
  }

  const handleCopy = () => {
    if (apiKey) navigator.clipboard.writeText(apiKey).catch(() => {})
  }

  const handleCreateOrg = async () => {
    const normalizedName = orgName.trim()
    if (!normalizedName || step1Done) return
    setLoading('org')
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const organization = await createOrg({ name: normalizedName })
      setOrgId(organization.id)
      setStoredOrgId(organization.id)
      setStoredOrgName(organization.name)
      setOrgName(organization.name)
      setStatusMessage('Organization created.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create organization.')
    } finally {
      setLoading(null)
    }
  }

  const handleProvisionAgent = async () => {
    if (!orgId || step2Done || !agentName.trim()) return
    setLoading('agent')
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const agent = await createAgent({
        org_id: orgId,
        name: agentName.trim(),
      })
      setAgentId(agent.id)
      setStoredAgentId(agent.id)
      if (agent.api_key) setApiKey(agent.api_key)
      setStatusMessage('Agent provisioned.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to provision agent.')
    } finally {
      setLoading(null)
    }
  }

  const handleSaveMandate = async () => {
    if (!agentId || step3Done) return
    const maxPerValue = Number(maxPer)
    const budgetValue = Number(budget)
    if (!Number.isFinite(maxPerValue) || maxPerValue <= 0) {
      setErrorMessage('Transaction limit must be a positive number.')
      return
    }
    if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
      setErrorMessage('Monthly budget must be a positive number.')
      return
    }
    if (merchants.length === 0) {
      setErrorMessage('Add at least one merchant before saving mandate.')
      return
    }

    setLoading('mandate')
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const mandate = await createMandate({
        agent_id: agentId,
        max_per_transaction: maxPerValue,
        approval_threshold: budgetValue,
        allowed_merchants: merchants,
      })
      setMandateId(mandate.id)
      setStoredMandateId(mandate.id)
      setStatusMessage('Mandate saved.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save mandate.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <h1 style={{ fontFamily: 'Inter', fontSize: '28px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Setup</h1>
        <p style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#737373', letterSpacing: '0.04em', marginTop: '4px', textTransform: 'uppercase' }}>
          Initialize Authorization Flow
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {/* Step 1: Create Org */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>01. Create Organization</span>
              <p style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', marginTop: '2px' }}>Define the root entity for this deployment.</p>
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: step1Done ? '#4ae176' : '#C08532', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {step1Done ? 'Configured' : 'In Progress'}
            </span>
          </div>
          <div>
            <label style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              Organization Name
            </label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Corp Automated Trading"
              style={{ width: '100%', backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e2e1', fontFamily: 'Space Grotesk', fontSize: '12px', padding: '8px 12px', outline: 'none', borderRadius: '2px' }}
              disabled={step1Done}
            />
          </div>
          <button
            onClick={handleCreateOrg}
            disabled={step1Done || !orgName.trim() || loading === 'org'}
            style={{ padding: '8px 16px', backgroundColor: step1Done || !orgName.trim() || loading === 'org' ? '#1A1A1A' : '#C08532', color: step1Done || !orgName.trim() || loading === 'org' ? '#555' : '#000', border: 'none', borderRadius: '2px', fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: step1Done || !orgName.trim() || loading === 'org' ? 'not-allowed' : 'pointer' }}
          >
            {loading === 'org' ? 'Creating...' : 'Create Org'}
          </button>
        </div>

        {/* Step 2: Provision Agent */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: step1Done ? 1 : 0.5, pointerEvents: step1Done ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>02. Provision Agent</span>
              <p style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', marginTop: '2px' }}>Generate credentials for the autonomous actor.</p>
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: step2Done ? '#4ae176' : '#C08532', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {step2Done ? 'Configured' : 'In Progress'}
            </span>
          </div>
          <div>
            <label style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              Agent Identifier
            </label>
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="trading-bot-alpha-v2"
              style={{ width: '100%', backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e2e1', fontFamily: 'Space Grotesk', fontSize: '12px', padding: '8px 12px', outline: 'none', borderRadius: '2px' }}
              disabled={step2Done}
            />
          </div>
          {apiKey && (
            <div style={{ backgroundColor: '#080808', border: '1px solid rgba(192,133,50,0.3)', padding: '10px 12px', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#C08532', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {apiKey}
              </span>
              <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C08532', fontSize: '14px', padding: '0 8px' }}>
                📋
              </button>
            </div>
          )}
          <button
            onClick={handleProvisionAgent}
            disabled={step2Done || !agentName.trim() || loading === 'agent'}
            style={{ padding: '8px 16px', backgroundColor: step2Done || !agentName.trim() || loading === 'agent' ? '#1A1A1A' : '#C08532', color: step2Done || !agentName.trim() || loading === 'agent' ? '#555' : '#000', border: 'none', borderRadius: '2px', fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: step2Done || !agentName.trim() || loading === 'agent' ? 'not-allowed' : 'pointer' }}
          >
            {loading === 'agent' ? 'Provisioning...' : 'Provision Agent'}
          </button>
        </div>

        {/* Step 3: Define Mandate */}
        <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: step2Done ? 1 : 0.5, pointerEvents: step2Done ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>03. Define Mandate</span>
              <p style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', marginTop: '2px' }}>Set spending limits and allowed merchants.</p>
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: step3Done ? '#4ae176' : '#C08532', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {step3Done ? 'Configured' : 'In Progress'}
            </span>
          </div>
          <div>
            <label style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              Allowed Merchants
            </label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {merchants.map((m) => (
                <span key={m} style={{ padding: '4px 8px', backgroundColor: '#080808', border: '1px solid rgba(192,133,50,0.3)', color: '#C08532', fontFamily: 'Space Grotesk', fontSize: '10px', borderRadius: '2px' }}>
                  {m}
                </span>
              ))}
            </div>
            <input
              value={merchantInput}
              onChange={(e) => setMerchantInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMerchant()}
              placeholder="Add Merchant ID..."
              style={{ width: '100%', backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e2e1', fontFamily: 'Space Grotesk', fontSize: '12px', padding: '8px 12px', outline: 'none', borderRadius: '2px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
                Transaction Limit
              </label>
              <input value={maxPer} onChange={(e) => setMaxPer(e.target.value)} placeholder="0.00" style={{ width: '100%', backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e2e1', fontFamily: 'Space Grotesk', fontSize: '12px', padding: '8px 12px', outline: 'none', borderRadius: '2px' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'Space Grotesk', fontSize: '10px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
                Monthly Budget
              </label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00" style={{ width: '100%', backgroundColor: '#080808', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e2e1', fontFamily: 'Space Grotesk', fontSize: '12px', padding: '8px 12px', outline: 'none', borderRadius: '2px' }} />
            </div>
          </div>
          <button
            onClick={handleSaveMandate}
            disabled={step3Done || loading === 'mandate'}
            style={{ padding: '8px 16px', backgroundColor: step3Done || loading === 'mandate' ? '#1A1A1A' : '#C08532', color: step3Done || loading === 'mandate' ? '#555' : '#000', border: 'none', borderRadius: '2px', fontFamily: 'Space Grotesk', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: step3Done || loading === 'mandate' ? 'not-allowed' : 'pointer' }}
          >
            {loading === 'mandate' ? 'Saving...' : 'Save Mandate'}
          </button>
        </div>
      </div>
      {statusMessage && (
        <div style={{ backgroundColor: 'rgba(74,225,118,0.08)', border: '1px solid rgba(74,225,118,0.25)', color: '#4ae176', padding: '10px 12px', fontFamily: 'Space Grotesk', fontSize: '11px', letterSpacing: '0.04em' }}>
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ backgroundColor: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.25)', color: '#ffb4ab', padding: '10px 12px', fontFamily: 'Space Grotesk', fontSize: '11px', letterSpacing: '0.04em' }}>
          {errorMessage}
        </div>
      )}
    </div>
  )
}
