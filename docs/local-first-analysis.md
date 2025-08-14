# Local-First Architecture Analysis

## Current State Analysis

### Current Architecture Issues
The app is **NOT truly local-first** currently. Here are the main issues:

1. **Direct Server Fetching**: `useProjects` hook (app/projects.tsx:24) directly calls `projectsService.getProjects()` which fetches from Supabase on every load
2. **Signed URL Regeneration**: Every `getProjects()` call regenerates signed URLs for images (services/projects.ts:16-30), causing significant storage egress
3. **No Local-First Loading**: Projects screen shows loading state while fetching from server instead of immediately showing local data

### Current Data Flow
```
App Start → useProjects hook → projectsService.getProjects() → Supabase fetch → Regenerate signed URLs → Display
```

### Existing Infrastructure (Good Foundation)
The app already has excellent local-first infrastructure that's partially implemented:

#### ✅ Local Storage Service (`services/localStorage.ts`)
- Complete CRUD operations for projects
- Sync status tracking (`synced`, `pending`, `syncing`, `error`)
- Dirty flag system for tracking changes
- Metadata management with last sync timestamps

#### ✅ Sync Service (`services/syncService.ts`)
- Bidirectional sync (to/from cloud)
- Conflict resolution for updates
- Background sync capabilities
- Retry mechanisms for failed syncs

#### ✅ Sync Context (`contexts/SyncContext.tsx`)
- React context for sync state management
- Automatic background syncing every 5 minutes
- App state change detection for sync triggers
- Pending changes tracking

#### ✅ Sync Button Component (`components/sync/SyncButton.tsx`)
- Manual sync trigger UI
- Visual indicators for pending changes and errors
- Haptic feedback for user interactions

### Current Problems

1. **Primary Data Source**: Projects are fetched from Supabase instead of local storage
2. **Excessive Network Calls**: Every app launch triggers:
   - Database query to fetch all projects
   - Multiple storage API calls to regenerate signed URLs for images
3. **Poor Offline Experience**: App shows loading state instead of cached data
4. **Storage Egress Costs**: Continuous signed URL regeneration is expensive

### Impact on Storage Egress
- **Every app launch**: Fetches all project images' signed URLs
- **Every project view**: Re-fetches signed URLs 
- **Background syncs**: Additional image URL refreshes
- **Result**: High Supabase storage egress costs

## Implementation Plan for True Local-First

### Phase 1: Switch Primary Data Source (High Priority)
**Goal**: Make local storage the primary data source

1. **Update useProjects Hook**
   - Change from `projectsService.getProjects()` to `localStorageService.getProjects()`
   - Remove loading state for local data (should be instant)
   - Add optional background refresh indicator

2. **Update Project Detail Views**
   - Use `localStorageService.getProject(id)` instead of server calls
   - Ensure all project operations use local storage first

3. **Modify Project Creation/Updates**
   - Save to local storage immediately
   - Mark as dirty for background sync
   - Remove direct server saves

### Phase 2: Optimize Image Handling (Critical for Egress)
**Goal**: Eliminate unnecessary signed URL generation

1. **Cache Signed URLs Locally**
   - Store signed URLs with expiration timestamps
   - Only regenerate when URLs are near expiration (< 24 hours remaining)
   - Include URL caching in `StoredProject` interface

2. **Background Image URL Refresh**
   - Check URL expiration during background sync
   - Refresh only expired URLs, not all URLs
   - Batch URL generation for efficiency

3. **Lazy Image Loading**
   - Generate signed URLs only when images are actually viewed
   - Cache generated URLs for reuse
   - Implement URL expiration checking

### Phase 3: Enhance Sync UX (Medium Priority)
**Goal**: Make sync behavior transparent to users

1. **Add Sync Status to Projects Screen**
   - Show sync button in header
   - Display pending changes count
   - Show last sync time

2. **Optimize Background Sync**
   - Reduce frequency of full syncs
   - Implement incremental sync based on timestamps
   - Add network connectivity checking

3. **Offline-First Messaging**
   - Clear indicators when working offline
   - Queue actions for when connectivity returns
   - Show sync progress during large operations

### Phase 4: Performance Optimizations (Low Priority)
**Goal**: Improve app performance and reduce costs

1. **Implement Smart Caching**
   - Cache frequently accessed project data
   - Implement cache invalidation strategies
   - Add cache size limits

2. **Optimize Image Storage**
   - Consider image compression/resizing
   - Implement progressive image loading
   - Add image format optimization

## Technical Implementation Details

### Modified Data Flow (Target)
```
App Start → Load from Local Storage (instant) → Display → Background sync (optional)
User Action → Update Local Storage → Mark dirty → Background sync
Image View → Check cached URL → Generate if expired → Cache new URL
Manual Sync → Explicit cloud sync → Refresh local data
```

### Key Files to Modify

1. **`hooks/projects/useProjects.ts`** (lines 22-33)
   - Replace `projectsService.getProjects()` with `localStorageService.getProjects()`
   - Remove loading state for local data
   - Add background refresh logic

2. **`services/projects.ts`** (lines 16-30)
   - Modify `getProjects()` to not automatically refresh all URLs
   - Add conditional URL refresh based on expiration
   - Implement selective URL generation

3. **`types/project.ts`** (if exists)
   - Add URL expiration fields to project interface
   - Include cache metadata

### Storage Structure Enhancement
```typescript
interface CachedProject extends StoredProject {
  image_url_expires_at?: string;
  image_url_cached_at?: string;
}
```

## Expected Benefits

1. **Immediate App Loading**: Projects appear instantly from local storage
2. **Reduced Storage Egress**: 90%+ reduction in signed URL generation
3. **Better Offline Experience**: Full functionality without internet
4. **Lower Costs**: Significant reduction in Supabase storage costs
5. **Improved Performance**: Faster project list and detail views

## Migration Strategy

1. **Gradual Rollout**: Implement local-first loading first, keep server sync as backup
2. **Data Migration**: Ensure existing cloud data syncs to local storage on first launch
3. **Fallback Handling**: Graceful degradation if local storage fails
4. **Testing**: Verify sync behavior in various network conditions

This analysis shows the app has excellent infrastructure for local-first architecture but needs the primary data source switched from server-first to local-first to achieve the desired benefits.