export type AppPage = 'dashboard' | 'setup' | 'simulator' | 'agents' | 'audit' | 'settings';

export interface AppContext {
  currentOrgId: string | null;
  currentOrgName: string | null;
  currentAgentId: string | null;
  currentPage: AppPage;
  onNavigate?: (page: AppPage) => void;
}
