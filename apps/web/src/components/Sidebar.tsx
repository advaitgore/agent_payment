import { getStoredAgentId, getStoredMandateId, getStoredOrgName } from '../lib/storage';
import type { AppPage } from '../types/app';

type NavItem = {
  key: string;
  label: string;
  icon: string;
};

function shortId(value: string) {
  return value.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function resolveOrgName(currentOrgName?: string | null) {
  return currentOrgName ?? getStoredOrgName() ?? 'Organization';
}

export default function Sidebar({
  currentPage = 'dashboard',
  currentOrgId,
  currentOrgName,
  currentAgentId,
  onNavigate,
}: {
  currentPage?: AppPage;
  currentOrgId?: string | null;
  currentOrgName?: string | null;
  currentAgentId?: string | null;
  onNavigate?: (page: AppPage) => void;
}) {
  const agentId = currentAgentId ?? getStoredAgentId();
  const mandateId = getStoredMandateId();

  const items: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
    },
    {
      key: 'setup',
      label: 'Setup',
      icon: 'settings',
    },
    {
      key: 'simulator',
      label: 'Simulator',
      icon: 'terminal',
    },
    {
      key: 'agent',
      label: 'Agent',
      icon: 'smart_toy',
    },
    {
      key: 'audit',
      label: 'Audit Log',
      icon: 'history_edu',
    },
  ];

  const variant = currentPage === 'setup' ? 'setup' : currentPage === 'simulator' ? 'simulator' : currentPage === 'audit' ? 'audit' : 'default';
  const orgName = resolveOrgName(currentOrgName);

  return (
    <aside className={`sidebar sidebar-${variant}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">AI_PAY_AUTH</div>
        <div className="sidebar-version">v1.0.4-stable</div>
        {(currentOrgId || currentOrgName) && (
          <div className="sidebar-org-card">
            <div className="sidebar-org-label">Current Org</div>
            <div className="sidebar-org-name">{orgName}</div>
            {currentOrgId && <div className="sidebar-org-id">{shortId(currentOrgId)}</div>}
          </div>
        )}
      </div>

      <nav className="sidebar-nav scroll-thin">
        {items.map((item) => {
          const isActive = item.key === currentPage;
          return (
            <button
              className={`sidebar-item${isActive ? ' active' : ''}`}
              key={item.key}
              type="button"
              onClick={() => onNavigate?.(item.key as AppPage)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-cta" type="button" onClick={() => onNavigate?.('setup')}>
          <span className="material-symbols-outlined">add</span>
          New Agent
        </button>

        {currentPage === 'setup' && (
          <div className="sidebar-avatar-card">
            <div className="sidebar-avatar">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div className="sidebar-avatar-meta">
              <div className="sidebar-avatar-name">AI System Avatar</div>
              <div className="sidebar-avatar-role">Admin</div>
            </div>
          </div>
        )}

        {currentPage === 'agent' && agentId && mandateId && (
          <div className="sidebar-org-card sidebar-subtle-card">
            <div className="sidebar-org-label">Selected IDs</div>
            <div className="sidebar-org-name">Agent {shortId(agentId)}</div>
            <div className="sidebar-org-id">Mandate {shortId(mandateId)}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
