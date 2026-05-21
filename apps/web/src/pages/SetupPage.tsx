import { useEffect, useState } from 'react'
import type { Page } from '../App'
import { createAgent, createMandate, createOrg } from '../lib/api'
import { getStoredAgentId, getStoredMandateId, getStoredOrgId, getStoredOrgName, setStoredAgentId, setStoredMandateId, setStoredOrgId, setStoredOrgName } from '../lib/storage'
import { tokens } from '../tokens'

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `${tokens.spacing.md} 0`, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
      <div style={{ borderBottom: `1px solid ${tokens.colors.border}`, paddingBottom: tokens.spacing.lg }}>
        <h1 style={{ fontFamily: tokens.typography.fontFamily.display, fontSize: tokens.typography.fontSize.display, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text.primary, letterSpacing: tokens.typography.letterSpacing.tight }}>Setup</h1>
        <p style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.tertiary, letterSpacing: tokens.typography.letterSpacing.wide, marginTop: tokens.spacing.sm, textTransform: 'uppercase' }}>
          Initialize Authorization Flow
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: tokens.spacing.md }}>
        {/* Step 1: Create Org */}
        <div style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, padding: tokens.spacing.lg, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text.primary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider }}>01. Create Organization</span>
              <p style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, marginTop: '2px' }}>Define the root entity for this deployment.</p>
            </div>
            <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: step1Done ? tokens.colors.success : tokens.colors.accent, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wide }}>
              {step1Done ? 'Configured' : 'In Progress'}
            </span>
          </div>
          <div>
            <label style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider, display: 'block', marginBottom: tokens.spacing.sm }}>
              Organization Name
            </label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Corp Automated Trading"
              style={{ width: '100%', backgroundColor: tokens.colors.background, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.secondary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, outline: 'none', borderRadius: tokens.radius.sm }}
              disabled={step1Done}
            />
          </div>
          <button
            onClick={handleCreateOrg}
            disabled={step1Done || !orgName.trim() || loading === 'org'}
            style={{ padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`, backgroundColor: step1Done || !orgName.trim() || loading === 'org' ? tokens.colors.surfaceAlt : tokens.colors.accent, color: step1Done || !orgName.trim() || loading === 'org' ? tokens.colors.text.muted : '#000', border: 'none', borderRadius: tokens.radius.sm, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, letterSpacing: tokens.typography.letterSpacing.widest, textTransform: 'uppercase', cursor: step1Done || !orgName.trim() || loading === 'org' ? 'not-allowed' : 'pointer' }}
          >
            {loading === 'org' ? 'Creating...' : 'Create Org'}
          </button>
        </div>

        {/* Step 2: Provision Agent */}
        <div style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, padding: tokens.spacing.lg, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md, opacity: step1Done ? 1 : 0.5, pointerEvents: step1Done ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text.primary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider }}>02. Provision Agent</span>
              <p style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, marginTop: '2px' }}>Generate credentials for the autonomous actor.</p>
            </div>
            <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: step2Done ? tokens.colors.success : tokens.colors.accent, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wide }}>
              {step2Done ? 'Configured' : 'In Progress'}
            </span>
          </div>
          <div>
            <label style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider, display: 'block', marginBottom: tokens.spacing.sm }}>
              Agent Identifier
            </label>
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="trading-bot-alpha-v2"
              style={{ width: '100%', backgroundColor: tokens.colors.background, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.secondary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, outline: 'none', borderRadius: tokens.radius.sm }}
              disabled={step2Done}
            />
          </div>
          {apiKey && (
            <div style={{ backgroundColor: tokens.colors.background, border: `1px solid rgba(192,133,50,0.3)`, padding: `10px ${tokens.spacing.md}`, borderRadius: tokens.radius.sm, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.accent, letterSpacing: tokens.typography.letterSpacing.wide, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {apiKey}
              </span>
              <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tokens.colors.accent, fontSize: '14px', padding: `0 ${tokens.spacing.md}` }}>
                📋
              </button>
            </div>
          )}
          <button
            onClick={handleProvisionAgent}
            disabled={step2Done || !agentName.trim() || loading === 'agent'}
            style={{ padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`, backgroundColor: step2Done || !agentName.trim() || loading === 'agent' ? tokens.colors.surfaceAlt : tokens.colors.accent, color: step2Done || !agentName.trim() || loading === 'agent' ? tokens.colors.text.muted : '#000', border: 'none', borderRadius: tokens.radius.sm, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, letterSpacing: tokens.typography.letterSpacing.widest, textTransform: 'uppercase', cursor: step2Done || !agentName.trim() || loading === 'agent' ? 'not-allowed' : 'pointer' }}
          >
            {loading === 'agent' ? 'Provisioning...' : 'Provision Agent'}
          </button>
        </div>

        {/* Step 3: Define Mandate */}
        <div style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, padding: tokens.spacing.lg, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md, opacity: step2Done ? 1 : 0.5, pointerEvents: step2Done ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text.primary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider }}>03. Define Mandate</span>
              <p style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, marginTop: '2px' }}>Set spending limits and allowed merchants.</p>
            </div>
            <span style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: step3Done ? tokens.colors.success : tokens.colors.accent, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wide }}>
              {step3Done ? 'Configured' : 'In Progress'}
            </span>
          </div>
          <div>
            <label style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider, display: 'block', marginBottom: tokens.spacing.sm }}>
              Allowed Merchants
            </label>
            <div style={{ display: 'flex', gap: tokens.spacing.sm, marginBottom: '10px', flexWrap: 'wrap' }}>
              {merchants.map((m) => (
                <span key={m} style={{ padding: `4px ${tokens.spacing.sm}`, backgroundColor: tokens.colors.background, border: `1px solid rgba(192,133,50,0.3)`, color: tokens.colors.accent, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, borderRadius: tokens.radius.sm }}>
                  {m}
                </span>
              ))}
            </div>
            <input
              value={merchantInput}
              onChange={(e) => setMerchantInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMerchant()}
              placeholder="Add Merchant ID..."
              style={{ width: '100%', backgroundColor: tokens.colors.background, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.secondary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, outline: 'none', borderRadius: tokens.radius.sm }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.md }}>
            <div>
              <label style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider, display: 'block', marginBottom: tokens.spacing.sm }}>
                Transaction Limit
              </label>
              <input value={maxPer} onChange={(e) => setMaxPer(e.target.value)} placeholder="0.00" style={{ width: '100%', backgroundColor: tokens.colors.background, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.secondary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, outline: 'none', borderRadius: tokens.radius.sm }} />
            </div>
            <div>
              <label style={{ fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: tokens.typography.letterSpacing.wider, display: 'block', marginBottom: tokens.spacing.sm }}>
                Monthly Budget
              </label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00" style={{ width: '100%', backgroundColor: tokens.colors.background, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.secondary, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.md, padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, outline: 'none', borderRadius: tokens.radius.sm }} />
            </div>
          </div>
          <button
            onClick={handleSaveMandate}
            disabled={step3Done || loading === 'mandate'}
            style={{ padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`, backgroundColor: step3Done || loading === 'mandate' ? tokens.colors.surfaceAlt : tokens.colors.accent, color: step3Done || loading === 'mandate' ? tokens.colors.text.muted : '#000', border: 'none', borderRadius: tokens.radius.sm, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, letterSpacing: tokens.typography.letterSpacing.widest, textTransform: 'uppercase', cursor: step3Done || loading === 'mandate' ? 'not-allowed' : 'pointer' }}
          >
            {loading === 'mandate' ? 'Saving...' : 'Save Mandate'}
          </button>
        </div>
      </div>
      {statusMessage && (
        <div style={{ backgroundColor: tokens.colors.successBg, border: `1px solid ${tokens.colors.successBorder}`, color: tokens.colors.success, padding: `10px ${tokens.spacing.md}`, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, letterSpacing: tokens.typography.letterSpacing.wide }}>
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ backgroundColor: tokens.colors.errorBg, border: `1px solid ${tokens.colors.errorBorder}`, color: tokens.colors.error, padding: `10px ${tokens.spacing.md}`, fontFamily: tokens.typography.fontFamily.body, fontSize: tokens.typography.fontSize.sm, letterSpacing: tokens.typography.letterSpacing.wide }}>
          {errorMessage}
        </div>
      )}
    </div>
  )
}
