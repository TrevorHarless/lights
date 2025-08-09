# Data Flow Analysis - ImageViewer Component System

## Current Prop Drilling Issues

The ImageViewer component system suffers from extensive prop drilling, where data and callbacks are passed through multiple component layers. This creates maintenance difficulties and tight coupling between components.

## Component Relationships & Data Flow

### 1. ImageViewer → BottomToolbar → LightSelectionPopover

**Props Passed Through Multiple Levels:**

```javascript
// ImageViewer.jsx:654-669
<BottomToolbar
  // Reference system props (5 props)
  hasReference={hasReference}
  isSettingReference={isSettingReference}
  onStartReference={startReferenceMode}
  onClearReference={clearReference}
  onCancelReference={cancelReferenceMode}
  
  // Asset system props (7 props)
  lightAssets={allAssets}
  selectedAsset={selectedAsset}
  onSelectAsset={setSelectedAsset}
  getAssetsByCategory={getAssetsByCategory}
  getCategories={getCategories}
  getSharedGradientDefs={getSharedGradientDefs}
  getLightDefinitions={getLightDefinitions}
  
  // Undo system props (2 props)
  canUndo={!!deletedString}
  onUndo={handleUndo}
/>
```

**Then BottomToolbar passes most of these to LightSelectionPopover:**

```javascript
// BottomToolbar.jsx:119-132
<LightSelectionPopover
  visible={showLightPopover}
  onClose={() => setShowLightPopover(false)}
  lightAssets={lightAssets}
  selectedAsset={selectedAsset}
  onSelectAsset={(asset) => {
    onSelectAsset(asset);
    setShowLightPopover(false);
  }}
  getAssetsByCategory={getAssetsByCategory}
  getCategories={getCategories}
  getSharedGradientDefs={getSharedGradientDefs}
  getLightDefinitions={getLightDefinitions}
/>
```

### 2. ImageViewer → FloatingSelectionControls

**Direct Props (9 props):**

```javascript
// ImageViewer.jsx:642-651
<FloatingSelectionControls
  selectedStringId={selectedStringId}
  selectedStringEndpoint={selectedStringEndpoint}
  onDeleteString={handleDeleteString}
  onDeselectString={deselectLightString}
  selectedWreathId={selectedWreathId}
  onDeleteWreath={handleDeleteWreath}
  onDeselectWreath={() => setSelectedWreathId(null)}
  interactionMode={interactionMode}
/>
```

### 3. ImageViewer → SimpleLightRenderer

**Props for Rendering (7 props):**

```javascript
// ImageViewer.jsx:609-618
<SimpleLightRenderer
  lightStrings={lightStrings}
  currentVector={currentVector}
  isDragging={isDragging}
  selectedStringId={selectedStringId}
  getAssetById={getAssetById}
  calculateLightPositions={calculateLightPositions}
  getLightSizeScale={getLightSizeScale}
  getLightRenderStyle={getLightRenderStyle}
/>
```

### 4. ImageViewer → WreathRenderer

**Props for Wreath Management (5 props):**

```javascript
// ImageViewer.jsx:629-635
<WreathRenderer
  wreaths={wreaths}
  selectedWreathId={selectedWreathId}
  onWreathSelect={setSelectedWreathId}
  showResizeHandles={interactionMode === 'wreath'}
  getResizeHandles={getResizeHandles}
/>
```

## Hook Dependencies and Coupling

### 1. Cross-Hook Dependencies

```javascript
// useLightStrings depends on external functions
const {
  lightStrings,
  // ... other returns
} = useLightStrings(lightAssets, getScaledLightSpacing);

// useVectorDrawing depends on multiple external states/functions
const { 
  currentVector, 
  isDragging: isDrawingString, 
  panResponder: stringPanResponder 
} = useVectorDrawing({
  selectedAsset,
  onVectorComplete: addLightString,
  onTapSelection: selectLightString,
  findClosestLightString,
  deselectLightString,
  isSettingReference,
  onReferenceComplete: handleReferenceLineComplete,
});
```

### 2. Derived State Management

```javascript
// ImageViewer.jsx:53-71 - Complex asset system merging
const allAssets = [...lightAssets, ...wreathAssets];
const [selectedAsset, setSelectedAsset] = React.useState(null);

const getAssetById = (id) => {
  return getLightAssetById(id) || getWreathAssetById(id);
};

const getAssetsByCategory = (category) => {
  if (category === 'wreath') {
    return wreathAssets;
  }
  return getLightAssetsByCategory(category);
};

const getCategories = () => {
  const lightCategories = getLightCategories();
  return [...lightCategories, 'wreath'];
};
```

## State Distribution Issues

### 1. Scattered State Management

State is managed at different levels without clear ownership:

- **ImageViewer Level**: `selectedAsset`, `nightModeEnabled`, `interactionMode`
- **Hook Level**: `lightStrings`, `wreaths`, `referenceLine`
- **Component Level**: `showLightPopover` (BottomToolbar)

### 2. Complex State Synchronization

```javascript
// ImageViewer.jsx:121-129 - Auto-switching interaction modes
React.useEffect(() => {
  if (selectedAsset) {
    if (selectedAsset.category === 'wreath') {
      setInteractionMode('wreath');
    } else {
      setInteractionMode('string');
    }
  }
}, [selectedAsset]);
```

### 3. Endpoint Position Tracking

```javascript
// ImageViewer.jsx:261-270 - Derived state from selection
useEffect(() => {
  if (selectedStringId) {
    const selectedString = lightStrings.find((string) => string.id === selectedStringId);
    if (selectedString) {
      setSelectedStringEndpoint(selectedString.end);
    }
  } else {
    setSelectedStringEndpoint(null);
  }
}, [selectedStringId, lightStrings]);
```

## Identified Prop Drilling Patterns

### Pattern 1: Asset System Drilling
**Flow**: `ImageViewer` → `BottomToolbar` → `LightSelectionPopover`
**Props**: 7 asset-related props passed through 2 levels

### Pattern 2: Reference System Drilling  
**Flow**: `ImageViewer` → `BottomToolbar`
**Props**: 5 reference-related props

### Pattern 3: Selection State Drilling
**Flow**: `ImageViewer` → `FloatingSelectionControls`
**Props**: 8 selection and callback props

### Pattern 4: Rendering Props Drilling
**Flow**: `ImageViewer` → Renderer Components
**Props**: 5-8 props per renderer component

## Impact Analysis

### Maintenance Issues
1. **Change Amplification**: Modifying asset system requires changes in 3+ files
2. **Interface Bloat**: Components have large prop interfaces unrelated to their core purpose
3. **Testing Complexity**: Mock objects needed for deeply nested prop dependencies

### Performance Issues
1. **Unnecessary Re-renders**: Prop changes trigger re-renders in intermediate components
2. **Callback Recreation**: Functions recreated on every render are passed down multiple levels
3. **State Synchronization**: Multiple useEffect calls to keep derived state in sync

## Recommendations for Context API Refactoring

### 1. Asset Management Context
**Purpose**: Centralize light and wreath asset management
**State**: `lightAssets`, `wreathAssets`, `selectedAsset`, asset helper functions
**Consumers**: `BottomToolbar`, `LightSelectionPopover`, renderer components

### 2. Editor State Context
**Purpose**: Manage editing modes and selections
**State**: `interactionMode`, `selectedStringId`, `selectedWreathId`, selection helpers
**Consumers**: `FloatingSelectionControls`, gesture handlers, renderers

### 3. Reference Scale Context
**Purpose**: Handle measurement and scaling system
**State**: `referenceLine`, `referenceLength`, `isSettingReference`, scale functions
**Consumers**: `BottomToolbar`, `ReferenceModal`, `ReferenceLineRenderer`

### 4. Rendering Context
**Purpose**: Provide rendering utilities and state
**State**: `lightStrings`, `wreaths`, rendering helpers, position calculators
**Consumers**: All renderer components

This refactoring would reduce prop drilling by 80%+ and create cleaner component interfaces focused on presentation rather than state management.