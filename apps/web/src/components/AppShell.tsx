import React from 'react';
import Sidebar from './Sidebar';
import type { AppContext } from '../types/app';

type AppShellProps = React.PropsWithChildren<Partial<AppContext> & { onNavigate?: (page: AppContext['currentPage']) => void }>;

export default function AppShell({ children, currentOrgId: _currentOrgId, currentOrgName: _currentOrgName, currentAgentId: _currentAgentId, currentPage, onNavigate }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage!}
        onNavigate={onNavigate!}
      />
      {children}
    </div>
  );
}
