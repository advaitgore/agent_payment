import { Link, useLocation } from 'react-router-dom';
import { getStoredAgentId, getStoredMandateId } from '../lib/storage';

type NavItem = {
  key: string;
  label: string;
  icon: string;
  path: string;
  match: (pathname: string) => boolean;
};

function resolveAgentPath() {
  const agentId = getStoredAgentId();
  return agentId ? `/agents/${agentId}` : '/setup';
}

function resolveMandatePath() {
  const mandateId = getStoredMandateId();
  return mandateId ? `/mandates/${mandateId}` : '/setup';
}

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  const items: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard',
      match: (path) => path.startsWith('/dashboard'),
    },
    {
      key: 'setup',
      label: 'Setup',
      icon: 'settings',
      path: '/setup',
      match: (path) => path.startsWith('/setup'),
    },
    {
      key: 'simulator',
      label: 'Simulator',
      icon: 'terminal',
      path: '/simulator',
      match: (path) => path.startsWith('/simulator'),
    },
    {
      key: 'agents',
      label: 'Agents',
      icon: 'smart_toy',
      path: resolveAgentPath(),
      match: (path) => path.startsWith('/agents'),
    },
    {
      key: 'audit',
      label: 'Audit Log',
      icon: 'history_edu',
      path: '/audit-log',
      match: (path) => path.startsWith('/audit-log'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'tune',
      path: resolveMandatePath(),
      match: (path) => path.startsWith('/mandates'),
    },
  ];

  const activeKey = items.find((item) => item.match(pathname))?.key;
  const variant = activeKey === 'setup' ? 'setup' : activeKey === 'simulator' ? 'simulator' : activeKey === 'audit' ? 'audit' : 'default';

  return (
    <aside className={`sidebar sidebar-${variant}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">AI_PAY_AUTH</div>
        <div className="sidebar-version">v1.0.4-stable</div>
      </div>

      <nav className="sidebar-nav scroll-thin">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <Link
              className={`sidebar-item${isActive ? ' active' : ''}`}
              key={item.key}
              to={item.path}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-cta">
          <span className="material-symbols-outlined">add</span>
          New Agent
        </button>

        {activeKey === 'setup' && (
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
      </div>
    </aside>
  );
}
