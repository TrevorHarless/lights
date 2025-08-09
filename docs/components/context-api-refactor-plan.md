# Context API Refactor Plan - ImageViewer Prop Drilling Solution

## Executive Summary

This document outlines a comprehensive plan to refactor the ImageViewer component system using React's Context API to eliminate prop drilling, improve maintainability, and create cleaner component interfaces.

## Current State Analysis

### Prop Drilling Statistics
- **BottomToolbar**: Receives 14 props, passes 8 to LightSelectionPopover
- **FloatingSelectionControls**: Receives 9 props
- **SimpleLightRenderer**: Receives 7 props  
- **WreathRenderer**: Receives 5 props
- **Total Props Drilled**: ~35 props across multiple component levels

## Proposed Context Architecture

### 1. AssetManagementContext

**Responsibility**: Centralize all asset-related state and operations

**State:**
```typescript
interface AssetManagementState {
  // Assets
  lightAssets: LightAsset[];
  wreathAssets: WreathAsset[];
  allAssets: Asset[];
  selectedAsset: Asset | null;
  
  // Asset Operations
  setSelectedAsset: (asset: Asset | null) => void;
  getAssetById: (id: string) => Asset | undefined;
  getAssetsByCategory: (category: string) => Asset[];
  getCategories: () => string[];
  
  // Light-specific functions
  getLightSizeScale: () => number;
  getLightRenderStyle: (asset: LightAsset) => any;
  getSharedGradientDefs: () => JSX.Element;
  getLightDefinitions: () => JSX.Element;
}
```

**Provider Location**: `contexts/editor/AssetManagementProvider.tsx`

**Consumers**: 
- `BottomToolbar`
- `LightSelectionPopover` 
- `SimpleLightRenderer`
- `WreathRenderer`

### 2. EditorStateContext

**Responsibility**: Manage editor modes, selections, and UI state

**State:**
```typescript
interface EditorStateContextValue {
  // Interaction Mode
  interactionMode: 'string' | 'wreath';
  setInteractionMode: (mode: 'string' | 'wreath') => void;
  
  // String Selection
  selectedStringId: string | null;
  selectedStringEndpoint: Point | null;
  selectLightString: (id: string) => void;
  deselectLightString: () => void;
  
  // Wreath Selection
  selectedWreathId: string | null;
  setSelectedWreathId: (id: string | null) => void;
  
  // UI State
  nightModeEnabled: boolean;
  nightModeIntensity: number;
  isMenuExpanded: boolean;
  toggleNightMode: () => void;
  setNightModeIntensity: (intensity: number) => void;
  setIsMenuExpanded: (expanded: boolean) => void;
}
```

**Provider Location**: `contexts/editor/EditorStateProvider.tsx`

**Consumers**:
- `ImageViewer` (for UI state)
- `FloatingSelectionControls`
- Gesture handlers
- Renderer components

### 3. ReferenceScaleContext

**Responsibility**: Handle measurement and scaling system

**State:**
```typescript
interface ReferenceScaleContextValue {
  // Reference State
  referenceLine: ReferenceLine | null;
  referenceLength: number | null;
  isSettingReference: boolean;
  showReferenceModal: boolean;
  hasReference: boolean;
  
  // Reference Actions
  startReferenceMode: () => void;
  cancelReferenceMode: () => void;
  handleReferenceLineComplete: (line: ReferenceLine) => void;
  confirmReferenceLength: (length: number) => void;
  clearReference: () => void;
  
  // Scale Calculations
  getScaledLightSpacing: (spacing: number) => number;
  getLightSizeScale: () => number;
}
```

**Provider Location**: `contexts/editor/ReferenceScaleProvider.tsx`

**Consumers**:
- `BottomToolbar`
- `ReferenceModal`
- `ReferenceLineRenderer`
- `useLightStrings` hook

### 4. RenderingContext

**Responsibility**: Manage renderable objects and their operations

**State:**
```typescript
interface RenderingContextValue {
  // Light Strings
  lightStrings: LightString[];
  deletedString: LightString | null;
  addLightString: (string: LightString) => void;
  deleteLightString: (id: string) => void;
  undoDelete: () => void;
  clearAllLightStrings: () => void;
  calculateLightPositions: (string: LightString) => Point[];
  findClosestLightString: (point: Point) => string | null;
  
  // Wreaths
  wreaths: Wreath[];
  addWreath: (wreath: Wreath) => void;
  removeWreath: (id: string) => void;
  moveWreath: (id: string, position: Point) => void;
  resizeWreath: (id: string, size: Size) => void;
  getWreathById: (id: string) => Wreath | undefined;
  findWreathAtPoint: (point: Point) => string | null;
  getResizeHandles: (wreath: Wreath) => ResizeHandle[];
  
  // Drawing State
  currentVector: Vector | null;
  isDragging: boolean;
}
```

**Provider Location**: `contexts/editor/RenderingProvider.tsx`

**Consumers**:
- All renderer components
- Gesture handlers
- `FloatingSelectionControls`

## Implementation Strategy

### Phase 1: Create Context Providers (Week 1)

#### 1.1 Create Base Context Structure
```bash
contexts/editor/
├── AssetManagementProvider.tsx
├── EditorStateProvider.tsx  
├── ReferenceScaleProvider.tsx
├── RenderingProvider.tsx
└── index.ts
```

#### 1.2 Implement AssetManagementProvider
- Move asset-related logic from `ImageViewer`
- Integrate `useLightAssets` and `useWreathAssets` hooks
- Create unified asset management interface

#### 1.3 Implement EditorStateProvider  
- Extract UI state from `ImageViewer`
- Handle interaction mode switching logic
- Manage selection states

#### 1.4 Implement ReferenceScaleProvider
- Integrate `useReferenceScale` hook
- Centralize measurement logic
- Handle modal state

#### 1.5 Implement RenderingProvider
- Integrate `useLightStrings` and `useWreathShapes` hooks
- Centralize drawing state from `useVectorDrawing`
- Manage all renderable objects

### Phase 2: Create Context Wrapper (Week 1)

#### 2.1 Create EditorProvider
```typescript
// contexts/editor/EditorProvider.tsx
export function EditorProvider({ children }: { children: React.ReactNode }) {
  return (
    <AssetManagementProvider>
      <ReferenceScaleProvider>
        <RenderingProvider>
          <EditorStateProvider>
            {children}
          </EditorStateProvider>
        </RenderingProvider>
      </ReferenceScaleProvider>
    </AssetManagementProvider>
  );
}
```

#### 2.2 Wrap ImageViewer
```typescript
// app/editor/[projectId].tsx
<EditorProvider>
  <ImageViewer imgSource={projectImageUri} onGoBack={handleGoBack} />
</EditorProvider>
```

### Phase 3: Refactor Components (Week 2)

#### 3.1 Refactor ImageViewer
**Before (35+ props managed):**
```typescript
const ImageViewer = ({ imgSource, onGoBack }) => {
  // Massive component with all state management
  const { lightAssets, ... } = useLightAssets();
  // ... 15+ hook calls and state variables
  
  return (
    <View>
      <BottomToolbar {...14props} />
      <FloatingSelectionControls {...9props} />
      // ... more prop drilling
    </View>
  );
};
```

**After (2 props + contexts):**
```typescript
const ImageViewer = ({ imgSource, onGoBack }) => {
  // Only local UI state remains
  const [isExporting, setIsExporting] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  
  // Gesture state (can't be moved to context due to reanimated)
  const scale = useSharedValue(1);
  // ... gesture values
  
  return (
    <View>
      <BottomToolbar />
      <FloatingSelectionControls />
      // ... no prop drilling
    </View>
  );
};
```

#### 3.2 Refactor BottomToolbar
**Before (14 props):**
```typescript
export function BottomToolbar({ hasReference, isSettingReference, ... }) {
  return <LightSelectionPopover {...8props} />;
}
```

**After (0 props):**
```typescript
export function BottomToolbar() {
  const { hasReference, isSettingReference, ... } = useReferenceScale();
  return <LightSelectionPopover />;
}
```

#### 3.3 Refactor Other Components
- **FloatingSelectionControls**: 9 props → 0 props
- **SimpleLightRenderer**: 7 props → 0 props  
- **WreathRenderer**: 5 props → 0 props
- **LightSelectionPopover**: 8 props → 0 props

### Phase 4: Create Custom Hooks (Week 2)

#### 4.1 Context Consumer Hooks
```typescript
// hooks/editor/useAssetManagement.ts
export const useAssetManagement = () => {
  const context = useContext(AssetManagementContext);
  if (!context) {
    throw new Error('useAssetManagement must be used within AssetManagementProvider');
  }
  return context;
};

// Similar hooks for other contexts...
```

#### 4.2 Composite Hooks
```typescript
// hooks/editor/useEditorSelection.ts
export const useEditorSelection = () => {
  const { selectedStringId, selectedWreathId, interactionMode } = useEditorState();
  const { selectLightString, deselectLightString } = useRendering();
  
  return {
    hasSelection: !!(selectedStringId || selectedWreathId),
    selectionType: interactionMode,
    selectString: selectLightString,
    deselectString: deselectLightString,
  };
};
```

### Phase 5: Testing & Validation (Week 3)

#### 5.1 Component Testing
- Unit tests for each context provider
- Integration tests for context combinations
- Component tests without prop mocking

#### 5.2 Performance Testing  
- Render performance comparison
- Memory usage analysis
- Re-render frequency measurement

#### 5.3 Functionality Testing
- Full user flow testing
- Gesture interaction testing
- State persistence verification

## Migration Guidelines

### 1. Backward Compatibility
- Maintain existing component interfaces during migration
- Use feature flags for gradual rollout
- Keep old props as optional during transition

### 2. Error Handling
- Add context availability checks
- Provide meaningful error messages
- Implement fallback mechanisms

### 3. TypeScript Integration
- Strong typing for all contexts
- Generic interfaces where applicable
- Proper inference for consumer hooks

## Expected Outcomes

### 1. Code Quality Improvements
- **Prop Drilling Reduction**: 80%+ reduction in prop passing
- **Component Simplification**: Components focus on presentation
- **Maintainability**: Centralized state management

### 2. Performance Benefits
- **Reduced Re-renders**: Components only re-render when relevant context changes
- **Memory Optimization**: Fewer prop objects created
- **Bundle Size**: Slightly larger due to context overhead

### 3. Developer Experience
- **Easier Testing**: No complex prop mocking required
- **Better IntelliSense**: Context-aware autocompletion
- **Cleaner Interfaces**: Self-documenting component APIs

## Risks and Mitigations

### 1. Context Over-consumption
**Risk**: Components consuming too many contexts
**Mitigation**: Use composite hooks, context splitting

### 2. Performance Regression
**Risk**: Unnecessary re-renders from context changes
**Mitigation**: Memo optimization, context value stability

### 3. Migration Complexity
**Risk**: Breaking changes during refactor
**Mitigation**: Incremental migration, comprehensive testing

## Success Metrics

1. **Prop Count Reduction**: From 35+ to <5 props across all components
2. **Component Size Reduction**: 50%+ reduction in ImageViewer.jsx lines
3. **Test Coverage**: Maintain 100% test coverage throughout migration
4. **Performance**: No degradation in rendering performance
5. **Bundle Size**: <10KB increase in final bundle size

## Timeline Summary

- **Week 1**: Context creation and provider setup
- **Week 2**: Component refactoring and hook creation  
- **Week 3**: Testing, validation, and optimization
- **Total Duration**: 3 weeks for complete implementation

This refactoring will transform the ImageViewer system from a prop-drilling nightmare into a clean, maintainable, context-driven architecture.