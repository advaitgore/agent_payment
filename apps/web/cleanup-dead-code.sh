#!/bin/bash
# Frontend Cleanup Script - Remove Dead Code
# This script removes the unused component files that were superseded by page components

# Files to delete (confirmed as unused):
rm -f apps/web/src/components/Dashboard.tsx
rm -f apps/web/src/components/AuditLog.tsx
rm -f apps/web/src/components/AgentDetail.tsx
rm -f apps/web/src/components/Setup.tsx
rm -f apps/web/src/pages/SimulatorPage.tsx
rm -f apps/web/src/components/Simulator.tsx

echo "Cleanup complete. Dead code files have been removed."
echo ""
echo "Verification:"
echo "- Run 'npm run build' in apps/web/ to verify no broken references"
echo "- Run 'npm run dev' to start the development server"
echo "- Test that Dashboard, Agents, and Audit Log pages load with real data"
