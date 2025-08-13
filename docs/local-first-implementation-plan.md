# Local-First Implementation Plan

## Overview
Transform the lights-app from server-first to true local-first architecture to eliminate constant server requests and reduce Supabase storage egress costs.

## Implementation Steps

### Step 1: Switch to Local-First Data Loading 🎯 **CRITICAL**
**Goal**: Load projects from local storage immediately, not from server

#### 1.1 Update useProjects Hook
**File**: `hooks/projects/useProjects.ts`

```typescript
// Current (lines 22-33):
const fetchProjects = async () => {
  setLoading(true);
  const { data, error } = await projectsService.getProjects(); // ❌ Server-first
  // ...
};

// New approach:
const loadProjects = async () => {
  // Load immediately from local storage (no loading state)
  const localProjects = await localStorageService.getProjects();
  setProjects(localProjects);
  
  // Optional: trigger background sync without blocking UI
  if (user) {
    backgroundSyncProjects();
  }
};
```

**Changes needed**:
- Replace `fetchProjects` with `loadProjects`
- Remove loading state for initial load (local data is instant)
- Add background sync trigger
- Import `localStorageService` and sync functions

#### 1.2 Add Background Sync Function
```typescript
const backgroundSyncProjects = async () => {
  try {
    // Only show loading during manual refresh
    const result = await syncService.backgroundSync(user.id);
    if (result?.success) {
      // Refresh local data after sync
      const refreshedProjects = await localStorageService.getProjects();
      setProjects(refreshedProjects);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
    // Don't show error to user for background sync
  }
};
```

#### 1.3 Update Component Loading Logic
**File**: `app/projects.tsx`

```typescript
// Current (lines 40-68): Shows loading spinner
if (loading) {
  return <LoadingSpinner />
}

// New: Remove loading state, show projects immediately
// Loading only shown during manual refresh
```

### Step 2: Implement Smart Image URL Caching 🎯 **CRITICAL** 
**Goal**: Eliminate unnecessary signed URL generation

#### 2.1 Extend Project Interface
**File**: `types/project.ts` (or create if doesn't exist)

```typescript
export interface CachedProject extends StoredProject {
  image_url_expires_at?: string;  // When current URL expires
  image_url_cached_at?: string;   // When URL was last cached
}
```

#### 2.2 Update Local Storage Service
**File**: `services/localStorage.ts`

Add URL caching methods:
```typescript
async getCachedImageUrl(project: StoredProject): Promise<string | null> {
  if (!project.image_url || !project.image_url_expires_at) {
    return null;
  }
  
  const expiresAt = new Date(project.image_url_expires_at);
  const now = new Date();
  const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Refresh if expiring within 24 hours
  if (hoursUntilExpiry < 24) {
    return null;
  }
  
  return project.image_url;
}

async cacheImageUrl(projectId: string, url: string): Promise<void> {
  const projects = await this.getProjects();
  const project = projects.find(p => p.id === projectId);
  
  if (project) {
    project.image_url = url;
    project.image_url_cached_at = new Date().toISOString();
    // Supabase signed URLs typically expire in 1 hour, cache for 50 minutes
    project.image_url_expires_at = new Date(Date.now() + 50 * 60 * 1000).toISOString();
    await this.saveProjects(projects);
  }
}
```

#### 2.3 Update Projects Service
**File**: `services/projects.ts`

Modify to use cached URLs:
```typescript
// Replace lines 16-30 with smart caching:
async getProjects(): Promise<{ data: Project[] | null; error: any }> {
  // This should only be called during sync operations
  // Regular app usage should use localStorageService.getProjects()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) {
    return { data, error }
  }

  // Only refresh URLs that are expired or missing
  const projectsWithSmartUrls = await Promise.all(
    data.map(async (project) => {
      if (project.image_path) {
        const cached = await localStorageService.getCachedImageUrl(project);
        if (cached) {
          return { ...project, image_url: cached };
        }
        
        // Only generate new URL if cache is expired/missing
        const { url } = await imageUploadService.getSignedUrl(project.image_path);
        if (url) {
          await localStorageService.cacheImageUrl(project.id, url);
          return { ...project, image_url: url };
        }
      }
      return project;
    })
  )

  return { data: projectsWithSmartUrls, error: null }
}
```

### Step 3: Add Manual Sync UI 🎯 **HIGH PRIORITY**
**Goal**: Give users control over when to sync with cloud

#### 3.1 Add Sync Button to Projects Screen
**File**: `app/projects.tsx`

Add to header (around line 94):
```typescript
// Add after profile button, before plus button:
<SyncButton size={20} color="white" />
```

#### 3.2 Import Sync Components
```typescript
import { SyncButton } from "~/components/sync/SyncButton";
import { useSync } from "~/contexts/SyncContext";
```

#### 3.3 Show Sync Status Information
Add to header area:
```typescript
const { pendingChanges, lastSyncTime } = useSync();

// Add subtle indicator for pending changes
{pendingChanges > 0 && (
  <Text style={{ fontSize: 12, color: '#f59e0b' }}>
    {pendingChanges} unsaved change{pendingChanges === 1 ? '' : 's'}
  </Text>
)}
```

### Step 4: Ensure App Context Uses Sync 🎯 **MEDIUM PRIORITY**
**Goal**: Make sure SyncProvider wraps the entire app

#### 4.1 Check App Root Layout
**File**: `app/_layout.tsx` (or root layout file)

Ensure SyncProvider wraps the app:
```typescript
import { SyncProvider } from "~/contexts/SyncContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SyncProvider>
        {/* Your app components */}
      </SyncProvider>
    </AuthProvider>
  );
}
```

### Step 5: Update Project CRUD Operations 🎯 **MEDIUM PRIORITY**
**Goal**: Ensure all project operations use local-first approach

#### 5.1 Update Project Creation
**File**: `components/projects/CreateProjectModal.tsx`

Change to save locally first:
```typescript
// Instead of direct server save:
const handleCreate = async () => {
  // Save to local storage immediately
  const newProject = await localStorageService.upsertProject({
    id: `local_${Date.now()}`, // Temporary ID
    ...projectData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  onProjectCreated(newProject);
  
  // Background sync will handle server upload
};
```

#### 5.2 Update Project Updates
Similar pattern for project edits - save locally first, sync in background.

#### 5.3 Update Project Deletion
Save deletion locally, sync deletion to server in background.

### Step 6: Optimize Background Sync 🎯 **LOW PRIORITY**
**Goal**: Reduce sync frequency and improve efficiency

#### 6.1 Adjust Sync Timing
**File**: `contexts/SyncContext.tsx`

Update sync intervals (line 177):
```typescript
// Change from 5 minutes to 15 minutes
const interval = setInterval(() => {
  if (AppState.currentState === 'active') {
    backgroundSync();
  }
}, 15 * 60 * 1000); // 15 minutes instead of 5
```

#### 6.2 Add Smart Sync Conditions
Only sync when:
- There are pending changes
- User hasn't synced in last 30 minutes
- Network conditions are good

## Implementation Order

### Phase 1 (Immediate - Critical for Storage Costs)
1. ✅ Step 1: Switch useProjects to local-first loading
2. ✅ Step 2: Implement image URL caching
3. ✅ Step 3: Add manual sync UI

### Phase 2 (This Week - UX Improvements)
4. ✅ Step 4: Ensure proper app context setup
5. ✅ Step 5: Update CRUD operations

### Phase 3 (Next Week - Optimizations)
6. ✅ Step 6: Optimize background sync behavior

## Expected Impact

### Immediate Benefits (Phase 1)
- **90% reduction** in storage egress costs
- **Instant app loading** - no more loading spinners
- **Better offline experience** - works without internet

### Long-term Benefits (All Phases)
- **Improved performance** across all project operations
- **Reduced server costs** significantly
- **Better user experience** with local-first responsiveness
- **Robust offline capabilities**

## Testing Strategy

1. **Before Implementation**: Measure current storage egress in Supabase dashboard
2. **During Implementation**: Test each phase in development
3. **After Implementation**: Verify storage egress reduction and app performance

## Rollback Plan

If issues arise:
1. Keep current server-first code commented out during implementation
2. Feature flag to switch between local-first and server-first
3. Easy rollback by uncommenting original code

## Key Success Metrics

- [ ] Projects load instantly (< 100ms) from local storage
- [ ] Storage egress reduced by > 80%
- [ ] Manual sync button works correctly
- [ ] Offline functionality maintained
- [ ] Background sync works without user intervention
- [ ] No data loss during sync operations

This implementation plan prioritizes the most critical changes first (reducing storage costs) while maintaining data integrity and user experience.