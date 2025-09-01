# Project Creation Data Flow Analysis

This document analyzes the complete data flow that occurs when a user creates a new project in the Holiday Lights Pro app, covering both local and cloud operations.

## Overview

The project creation process follows a "local-first" architecture with background cloud synchronization. This ensures users get instant feedback while data is asynchronously synced to the cloud.

## High-Level Flow

```
User Input → Local Creation → UI Update → Background Cloud Sync → Final Reconciliation
```

## Detailed Data Flow

### 1. User Interface Layer

**File**: `components/projects/CreateProjectModal.tsx`

- **Input Collection**: User fills out project form (name, description, address, phone, image)
- **Local Image Handling**: Selected image URI is stored locally for immediate display
- **Validation**: Basic validation (name required) before proceeding
- **Local Project Creation**: Creates a temporary project object with local ID

```typescript
const localProject: Project = {
  id: `local_${Date.now()}`, // Temporary local ID
  user_id: userId,
  name: newProjectName.trim(),
  description: newProjectDescription.trim() || undefined,
  address: newProjectAddress.trim() || undefined,
  phone_number: newProjectPhone.trim() || undefined,
  image_url: selectedImage || undefined, // Local image URI initially
  image_path: undefined, // Set after cloud upload
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

### 2. Project Management Layer

**File**: `hooks/projects/useProjects.ts`

The `handleProjectCreated` function coordinates the entire creation process:

#### Immediate Local Operations
1. **Local Storage**: Project immediately saved to AsyncStorage with sync metadata
2. **UI Update**: Project appears instantly in the projects list
3. **Sync Status**: Project marked as `is_dirty: true` and `sync_status: 'pending'`

```typescript
await localStorageService.upsertProject({
  ...newProject,
  is_dirty: true,
  sync_status: 'pending',
});

// Update UI immediately
setProjects((prev) => [newProject, ...prev]);
```

#### Background Cloud Operations
4. **Background Upload**: `backgroundUploadProject` function handles cloud operations asynchronously

### 3. Local Storage Layer

**File**: `services/localStorage.ts`

#### Storage Structure
- **Projects Cache**: In-memory cache (5-second duration) for performance
- **AsyncStorage**: Persistent local storage for projects
- **Metadata**: Sync timestamps and user information

#### Key Operations
- **Upsert Project**: Adds or updates project with sync metadata
- **Cache Management**: Automatic cache invalidation on user change
- **Sync Status Tracking**: Tracks pending, syncing, synced, and error states

### 4. Background Cloud Sync Process

**File**: `hooks/projects/useProjects.ts` → `backgroundUploadProject`

#### Phase 1: Image Upload (if applicable)
1. **Service**: `services/imageUpload.ts`
2. **Process**: 
   - Read image as base64
   - Generate unique filename: `${userId}/${timestamp}.${ext}`
   - Upload to Supabase Storage bucket `project-images`
   - Generate signed URL (1-year expiration)

```typescript
const { data: uploadData, error } = await supabase.storage
  .from('project-images')
  .upload(filePath, arrayBuffer, {
    contentType: `image/${fileExt}`,
    cacheControl: '3600',
    upsert: false,
  });
```

#### Phase 2: Project Database Creation
1. **Service**: `services/projects.ts` → `createProject`
2. **Process**:
   - Insert project into Supabase `projects` table
   - Include uploaded image URL and path
   - Return server-generated project ID

#### Phase 3: Local Reconciliation
1. **Remove Temporary Project**: Delete local temporary project
2. **Store Server Project**: Save server project with real ID
3. **Update Sync Status**: Mark as `synced` and `is_dirty: false`
4. **Cache Image URL**: Store signed URL with expiration timestamp
5. **Refresh UI**: Update projects list to reflect server state

### 5. Image Management System

**File**: `services/imageUpload.ts`

#### Upload Process
- **Permission Check**: Camera and media library permissions
- **File Processing**: Base64 encoding and ArrayBuffer conversion
- **Storage Upload**: Supabase Storage with organized folder structure
- **URL Generation**: Signed URLs for secure access

#### Caching Strategy
- **Local Caching**: Image URLs cached with expiration timestamps
- **Smart Refresh**: URLs refreshed 4 hours before expiration
- **Fallback**: Local image URIs used during upload process

### 6. Error Handling & Recovery

#### Sync Failures
- **Error States**: Projects marked with `sync_status: 'error'`
- **Retry Logic**: Background sync attempts retry failed uploads
- **User Experience**: Local data preserved, sync happens transparently

#### Network Conditions
- **Offline Support**: Projects created and used locally without internet
- **Sync on Reconnect**: Background sync resumes when connectivity restored
- **Data Consistency**: Local-first approach ensures no data loss

## Sync Status States

| State | Description | UI Indication |
|-------|-------------|---------------|
| `pending` | Created locally, waiting for cloud sync | Subtle indicator |
| `syncing` | Currently uploading to cloud | Loading state |
| `synced` | Successfully synchronized | No indicator |
| `error` | Sync failed, will retry | Error indicator |

## Data Persistence Layers

### Local Storage (Primary)
- **Technology**: AsyncStorage + in-memory cache
- **Purpose**: Instant access, offline support
- **Scope**: User-specific data with cache isolation

### Cloud Storage (Secondary)
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage buckets
- **Purpose**: Backup, cross-device sync, collaboration

## Performance Optimizations

### Caching Strategy
1. **In-Memory Cache**: 5-second cache for frequently accessed data
2. **Image URL Caching**: Smart expiration-based refresh
3. **User Isolation**: Cache clearing on user changes

### Background Operations
1. **Non-Blocking**: UI updates immediately, sync happens in background
2. **Atomic Operations**: All-or-nothing sync to prevent data corruption
3. **Smart Retries**: Failed syncs automatically retried

## Security Considerations

### Image Security
- **Signed URLs**: Time-limited access to stored images
- **User Isolation**: Files stored in user-specific folders
- **Permission Checks**: Device permissions validated before access

### Data Privacy
- **User Scoping**: All operations scoped to authenticated user
- **Cache Isolation**: User data separated in local cache
- **Secure Upload**: Direct-to-storage upload without server intermediary

## Integration Points

### Authentication Context
- **User Management**: `contexts/AuthContext.tsx`
- **User Scoping**: All operations tied to authenticated user ID

### Sync Context
- **Background Sync**: `contexts/SyncContext.tsx`
- **Status Monitoring**: Global sync status tracking

### Navigation
- **Route Management**: Projects list auto-refreshes on focus
- **Deep Linking**: Direct project access via router

## Monitoring & Debugging

### Logging Strategy
- **Console Logging**: Structured logs for each operation phase
- **Error Tracking**: Comprehensive error capture and reporting
- **Performance Metrics**: Background operation timing

### Debug Information
- **Sync Status**: Visible sync states for debugging
- **Cache Statistics**: In-memory cache hit/miss ratios
- **Network State**: Online/offline operation modes

## Future Considerations

### Scalability
- **Batch Operations**: Multiple projects creation and sync
- **Compression**: Image optimization before upload
- **CDN Integration**: Global image delivery optimization

### Collaboration
- **Shared Projects**: Multi-user project access
- **Real-time Sync**: Live collaboration features
- **Conflict Resolution**: Merge strategies for concurrent edits

---

This data flow ensures a responsive user experience while maintaining data consistency and reliability across local and cloud storage systems.