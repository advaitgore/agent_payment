import React from 'react';
import Sidebar from './Sidebar';
import type { AppContext } from '../types/app';

type AppShellProps = React.PropsWithChildren<Partial<AppContext> & { onNavigate?: (page: AppContext['currentPage']) => void }>;

export default function AppShell({ children, currentOrgId, currentOrgName, currentAgentId, currentPage, onNavigate }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar
        currentAgentId={currentAgentId}
        currentOrgId={currentOrgId}
        currentOrgName={currentOrgName}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
      {children}
    </div>
  );
}
