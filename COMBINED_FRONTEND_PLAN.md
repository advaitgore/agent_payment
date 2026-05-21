# Combined Frontend Plan: Cleanup + MVP Refinement

## Overview

**Goal**: Complete the frontend refactoring started in the cleanup phase, then add MVP-critical enhancements (manual refresh, clean UI, working flows).

**Current State**: ~85% ready for MVP testing
- ✅ Dead code isolated (not imported)
- ✅ Mock data replaced with real API
- ✅ Design tokens implemented
- ✅ Empty states working
- ⚠️ No manual refresh buttons
- ⚠️ Hardcoded metrics remain
- ⚠️ Non-functional Settings toggles

**Target State**: Production-ready MVP with clean, intentional UI that supports the flow: Signup → Empty → Connect Agent → Metrics Populate

---

## Implementation Plan

### **Phase 1: Delete Dead Code** *(cleanup finalization)*

**Files to delete** (6 total):
- `apps/web/src/components/Dashboard.tsx`
- `apps/web/src/components/AuditLog.tsx`
- `apps/web/src/components/AgentDetail.tsx`
- `apps/web/src/components/Setup.tsx`
- `apps/web/src/pages/SimulatorPage.tsx`
- `apps/web/src/components/Simulator.tsx`

**Action**: Execute git rm for all 6 files

```bash
git rm apps/web/src/components/{Dashboard,AuditLog,AgentDetail,Setup,Simulator}.tsx \
         apps/web/src/pages/SimulatorPage.tsx
git commit -m "cleanup: remove dead code components"
```

**Status**: Blocking verification until these are deleted

---

### **Phase 2: Add Manual Refresh Buttons** *(MVP critical)*

**Design Decision**: Refresh buttons should be:
- Subtle secondary styling (border, transparent bg) to not distract from content
- Positioned in existing header toolbar areas (no layout disruption)
- Show "Refreshing..." state while loading
- Use consistent button styling from `tokens.ts`

**Implementation**:

#### **2.1 DashboardPage.tsx**
- **Location**: Top-right of header (currently empty area)
- **Add state**: `const [isRefreshing, setIsRefreshing] = useState(false)`
- **Add function**:
  ```typescript
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([
      loadAgents(),
      loadRecentEvents(),
      loadSpendingSummary()
    ])
    setIsRefreshing(false)
  }
  ```
- **Add button** in header right flex area:
  ```typescript
  <button 
    onClick={handleRefresh}
    disabled={isRefreshing}
    style={{
      padding: tokens.spacing.sm,
      border: `1px solid ${tokens.colors.border}`,
      backgroundColor: 'transparent',
      color: tokens.colors.text.secondary,
      cursor: isRefreshing ? 'not-allowed' : 'pointer',
      opacity: isRefreshing ? 0.6 : 1,
      transition: tokens.transitions.fast,
    }}
  >
    {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
  </button>
  ```

#### **2.2 AgentsPage.tsx**
- **Location**: Top-right header, right of agent selector
- **Add state**: `const [isRefreshing, setIsRefreshing] = useState(false)`
- **Add function**:
  ```typescript
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([
      loadAgents(),
      loadMandates(),
      loadSpendingSummary()
    ])
    setIsRefreshing(false)
  }
  ```
- **Add button** in header right flex area (same pattern as DashboardPage)

#### **2.3 AuditLogPage.tsx**
- **Location**: Top-right toolbar, after filter buttons
- **Add state**: `const [isRefreshing, setIsRefreshing] = useState(false)`
- **Add function**:
  ```typescript
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadAuditEvents()
    setIsRefreshing(false)
  }
  ```
- **Add button** in existing toolbar flex container (gap already set to `tokens.spacing.sm`)

---

### **Phase 3: Remove Hardcoded "System Health" Metrics** *(polish)*

**Issue**: Dashboard and AgentsPage show fake latency (24ms) and success rate (99.98%) hardcoded.

**Decision**: Remove for MVP (we don't have real backend metrics yet).

#### **3.1 DashboardPage.tsx**
- **Lines 69-75**: Delete `const HEALTH = [28, 46, 33, 72, 55]` (fake data)
- **Lines 133-147**: Delete entire "System Health" card section
- **Result**: Dashboard shows 4 KPI cards (Total Agents, Auth Requests, Approval Rate, Total Spend) + Recent Events

#### **3.2 AgentsPage.tsx**
- **Lines 97**: Delete `const HEALTH = [28, 46, 33, 72, 55]` (same fake data)
- **Lines 200-218**: Delete entire "System Health" card section
- **Result**: AgentsPage shows agent list + mandate spending info (no fake metrics)

---

### **Phase 4: Clean Up Settings > Notifications** *(polish)*

**Issue**: SettingsPage.tsx Lines 94-112 show toggle switches that don't do anything.

**Action**: Remove entire Notifications section for MVP.

#### **4.1 SettingsPage.tsx**
- **Lines 94-112**: Delete the entire Notifications card and toggle items
- **Leave**: Email preferences, webhook settings (if functional)
- **Result**: Settings page is leaner, only shows real features

---

### **Phase 5: Verify & Test** *(quality gate)*

#### **5.1 Build Verification**
```bash
cd apps/web
npm run build
```
- Should complete with **zero errors**
- No broken imports (dead files deleted)
- TypeScript strict mode passes

#### **5.2 Development Server**
```bash
npm run dev
```
- App starts successfully
- No console errors or warnings about missing components

#### **5.3 Manual Flow Testing** *(critical path)*

**Scenario 1: First-time user**
1. Load app → Auth page
2. Signup (create org, get API key in Setup)
3. Navigate to Dashboard → should show all 0s, "No data yet"
4. Navigate to Agents → should show "No agents configured"
5. Navigate to Audit Log → should show "No events match filter"

**Scenario 2: Populate with data**
1. Create an agent in Setup page (get API key)
2. Create mandate in Setup page (set $500 monthly limit)
3. Click "Refresh" on Dashboard → should still show 0 requests (agent not used yet)
4. Manually call API to simulate agent purchase request (via curl or Postman):
   ```bash
   curl -X POST http://localhost:8000/requests \
     -H "x-api-key: <agent-api-key>" \
     -H "Content-Type: application/json" \
     -d '{"merchant": "AWS", "amount": 100.00, "category": "cloud", "description": "test"}'
   ```
5. Click "Refresh" on Dashboard → should show 1 request, 1 agent, approval metrics
6. Click "Refresh" on AuditLog → should show the evaluation event
7. Click "Refresh" on Agents → should show agent with updated spending

**Scenario 3: Verify empty states gracefully handle errors**
1. Stop backend server
2. Try to load Dashboard
3. Should show error message, not crash

#### **5.4 Visual Consistency Check**
- [ ] Refresh buttons match secondary button styling
- [ ] All buttons use `tokens.*` for colors/spacing
- [ ] No hardcoded color codes except in tokens.ts
- [ ] Sidebar nav items highlight correctly
- [ ] TopBar and user section aligned properly
- [ ] Empty state messages are friendly and clear

#### **5.5 Code Quality Check**
```bash
# Verify no dead code references
grep -r "Dashboard\|AuditLog\|AgentDetail\|Setup\|Simulator" apps/web/src --include="*.tsx" --include="*.ts"
# Should return: ZERO matches in code (only in comments or git history)

# Verify refresh buttons added
grep -r "Refresh" apps/web/src/pages --include="*.tsx"
# Should show refresh button text on Dashboard, Agents, AuditLog pages

# Verify hardcoded metrics removed
grep -r "24ms\|99.98%\|System Health" apps/web/src --include="*.tsx"
# Should return: ZERO matches
```

---

## Relevant Files

### **Files to Delete**
- `apps/web/src/components/Dashboard.tsx`
- `apps/web/src/components/AuditLog.tsx`
- `apps/web/src/components/AgentDetail.tsx`
- `apps/web/src/components/Setup.tsx`
- `apps/web/src/pages/SimulatorPage.tsx`
- `apps/web/src/components/Simulator.tsx`

### **Files to Modify** (add refresh buttons)
- `apps/web/src/pages/DashboardPage.tsx` — Add refresh button, remove HEALTH card
- `apps/web/src/pages/AgentsPage.tsx` — Add refresh button, remove HEALTH card
- `apps/web/src/pages/AuditLogPage.tsx` — Add refresh button

### **Files to Modify** (cleanup Settings)
- `apps/web/src/pages/SettingsPage.tsx` — Remove Notifications section

---

## Verification

**Build Check** (must pass):
```bash
npm run build
```

**Dev Server Check** (must start):
```bash
npm run dev
```

**Visual Check**: 
- Dashboard: 4 KPI cards, Recent Events section, Refresh button (top-right)
- Agents: Agent list (or empty state), Refresh button (top-right)
- AuditLog: Event table + filter toolbar with Refresh button (far-right)
- Settings: Email + Webhook sections (no Notifications)

**Data Flow Check**:
- Empty on signup ✅
- Metrics populate after agent creates requests ✅
- Refresh button updates data ✅
- No errors in console ✅

---

## Decisions

- **Dead code**: Fully deleted (git rm)
- **Mock metrics**: Removed System Health cards (no real backend metrics yet)
- **Refresh**: Manual only (no polling) — button available on 3 main pages
- **Settings**: Simplified (removed non-functional Notifications)
- **Button style**: Secondary pattern (border, transparent) to keep UI clean
- **Design**: Intentional, minimal — no clutter, clear information hierarchy
- **MVP scope**: Focus on working flows, not fancy features

---

## Design Principles Applied

- **Restraint**: Removed hardcoded metrics and non-functional toggles (less is more)
- **Intentionality**: Refresh buttons are subtle, positioned in natural toolbar areas
- **Consistency**: All buttons use tokens, all pages follow same header pattern
- **Clarity**: Empty states clearly communicate "no data yet" without confusion
- **Usability**: Manual refresh available exactly where user expects (top-right)

---

## Timeline & Phases

1. **Phase 1** (5 min): Delete 6 dead files via git rm
2. **Phase 2** (30 min): Add refresh buttons to 3 pages
3. **Phase 3** (10 min): Remove hardcoded metrics
4. **Phase 4** (5 min): Clean up Settings
5. **Phase 5** (20 min): Test and verify

**Total**: ~70 minutes

---

## Success Criteria

- ✅ Build succeeds with zero errors
- ✅ App loads and no console errors
- ✅ Dashboard shows real data (or empty state)
- ✅ Agents page shows real agents (or empty state)
- ✅ AuditLog shows real events (or empty state)
- ✅ Refresh buttons work and show "Refreshing..." state
- ✅ Manual flow works: Signup → Empty → Agent → Metrics
- ✅ No hardcoded metrics visible
- ✅ No non-functional toggles in Settings
- ✅ All UI feels intentional and professional
