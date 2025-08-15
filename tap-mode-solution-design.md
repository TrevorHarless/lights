# Tap Mode Solution Design

## Overview

Based on the current gesture system analysis, this document outlines a comprehensive solution for adding tap-to-place singular light functionality while preserving existing zoom/drag behavior and minimizing gesture conflicts.

## Core Solution Architecture

### 1. Three-Mode System Enhancement

**Current**: `'string' | 'wreath'`  
**Proposed**: `'string' | 'wreath' | 'tap'`

**Mode Behavior**:
- **String Mode**: Current drag-to-create behavior
- **Wreath Mode**: Current tap/drag wreath manipulation
- **Tap Mode**: NEW - tap to place individual lights

### 2. UI Integration Strategy

#### BottomToolbar Enhancement
```
[Ruler] [Mode Toggle] [Light Selection] [Undo]
```

**Mode Toggle Implementation**:
- **Icon**: Chain link (string) ↔ Cursor/crosshair (tap)
- **Position**: Between ruler and light selection
- **Visual State**: Highlighted background when tap mode active
- **Behavior**: Toggles between string and tap modes only
  - Wreath mode remains auto-activated by asset selection

#### Visual Feedback System
1. **Mode Indicator**: Persistent visual cue when in tap mode
2. **Placement Preview**: Ghost light follows finger in tap mode
3. **Placement Confirmation**: Brief animation on successful placement

### 3. Gesture Handling Solution

#### Modified Tap Detection Logic (`useVectorDrawing.js`)

**Current Problem**:
```javascript
if (isTap) {
  // Only handles selection, not placement
  const closestString = findClosestLightString(point);
  if (closestString) {
    onTapSelection(closestString.id);
  } else {
    deselectLightString();
  }
}
```

**Proposed Solution**:
```javascript
if (isTap) {
  const point = { x: locationX, y: locationY };
  
  // Priority 1: Tap Mode Placement
  if (interactionMode === 'tap' && selectedAsset && onSingleLightPlace) {
    onSingleLightPlace(point, selectedAsset.id);
    return;
  }
  
  // Priority 2: Selection (existing behavior)
  const closestString = findClosestLightString(point);
  const closestSingleLight = findSingleLightAtPoint?.(point);
  
  if (closestSingleLight) {
    onTapSelection('single', closestSingleLight.id);
  } else if (closestString) {
    onTapSelection('string', closestString.id);
  } else {
    deselectAll();
  }
}
```

#### Gesture Priority Matrix

| Mode | Tap Empty Space | Tap Asset | Drag |
|------|----------------|-----------|------|
| **String** | Deselect all | Select asset | Create string |
| **Tap** | Place light* | Select asset | No action** |
| **Wreath** | Deselect all | Select wreath | Move/resize |

*Only if asset selected  
**Drag disabled in tap mode to prevent accidental strings

### 4. Data Architecture

#### New Single Light Structure
```javascript
// Single light entity
{
  id: string,           // `single-${timestamp}-${random}`
  position: { x, y },   // Placement coordinates
  assetId: string,      // Reference to light asset
  timestamp: number,    // For ordering/undo
  metadata?: object     // Future extensibility
}
```

#### New Hook: `useSingleLights.js`
```javascript
export function useSingleLights() {
  const [singleLights, setSingleLights] = useState([]);
  const [selectedSingleLightIds, setSelectedSingleLightIds] = useState([]);
  const [deletedSingleLights, setDeletedSingleLights] = useState([]);

  return {
    singleLights,
    selectedSingleLightIds,
    
    // CRUD operations
    addSingleLight: (position, assetId) => { /* ... */ },
    removeSingleLight: (lightId) => { /* ... */ },
    updateSingleLight: (lightId, updates) => { /* ... */ },
    
    // Selection management
    selectSingleLight: (lightId) => { /* ... */ },
    deselectAllSingleLights: () => { /* ... */ },
    
    // Utilities
    findSingleLightAtPoint: (point, threshold = 20) => { /* ... */ },
    clearAllSingleLights: () => { /* ... */ },
    
    // Undo system
    undoDeleteSingleLight: () => { /* ... */ },
  };
}
```

#### New Component: `SingleLightRenderer.jsx`
```javascript
export function SingleLightRenderer({
  singleLights,
  selectedSingleLightIds,
  getAssetById,
  getLightSizeScale,
  getLightRenderStyle,
}) {
  return (
    <>
      {singleLights.map(light => {
        const asset = getAssetById(light.assetId);
        const style = getLightRenderStyle(light.assetId, getLightSizeScale());
        const isSelected = selectedSingleLightIds.includes(light.id);

        return (
          <View
            key={light.id}
            style={[
              {
                position: 'absolute',
                left: light.position.x - (style.width / 2),
                top: light.position.y - (style.height / 2),
              },
              style,
              isSelected && {
                borderWidth: 2,
                borderColor: '#007AFF',
              }
            ]}
          />
        );
      })}
    </>
  );
}
```

### 5. Integration Points

#### `ImageViewer.jsx` Changes

**State Extensions**:
```javascript
// Add single lights hook
const {
  singleLights,
  selectedSingleLightIds,
  addSingleLight,
  removeSingleLight,
  findSingleLightAtPoint,
  selectSingleLight,
  deselectAllSingleLights,
} = useSingleLights();

// Modify interaction mode to include tap
const [interactionMode, setInteractionMode] = React.useState('string');

// Modified auto-switching logic
React.useEffect(() => {
  if (selectedAsset && interactionMode !== 'tap') {
    if (selectedAsset.category === 'wreath') {
      setInteractionMode('wreath');
    } else {
      setInteractionMode('string');
    }
  }
}, [selectedAsset, interactionMode]);
```

**Gesture Handler Updates**:
```javascript
// Pass new props to useVectorDrawing
const { currentVector, isDragging, panResponder } = useVectorDrawing({
  // ... existing props
  interactionMode,
  onSingleLightPlace: addSingleLight,
  findSingleLightAtPoint,
  onTapSelection: handleTapSelection, // Enhanced handler
});
```

**Render Integration**:
```javascript
<View style={[StyleSheet.absoluteFill, styles.lightsLayer]} {...activePanResponder.panHandlers}>
  <SimpleLightRenderer ... />
  
  {/* NEW: Single light renderer */}
  <SingleLightRenderer
    singleLights={singleLights}
    selectedSingleLightIds={selectedSingleLightIds}
    getAssetById={getAssetById}
    getLightSizeScale={getLightSizeScale}
    getLightRenderStyle={getLightRenderStyle}
  />
  
  <ReferenceLineRenderer ... />
  <WreathRenderer ... />
</View>
```

### 6. Enhanced Selection System

#### Unified Selection Handler
```javascript
const handleTapSelection = (type, id) => {
  // Clear other selections first
  deselectLightString();
  setSelectedWreathId(null);
  deselectAllSingleLights();
  
  // Apply new selection
  switch (type) {
    case 'string':
      selectLightString(id);
      break;
    case 'single':
      selectSingleLight(id);
      break;
    case 'wreath':
      setSelectedWreathId(id);
      break;
  }
};
```

#### Extended FloatingSelectionControls
```javascript
export function FloatingSelectionControls({
  // Existing props...
  // NEW props
  selectedSingleLightIds,
  onDeleteSingleLights,
  onDeselectSingleLights,
}) {
  // Show controls for single lights
  if (selectedSingleLightIds.length > 0) {
    const position = calculateControlPosition(selectedSingleLights);
    return (
      <View style={[floatingControlStyle, { left: position.x, top: position.y }]}>
        <TouchableOpacity onPress={onDeleteSingleLights}>
          <MaterialIcons name="delete" size={24} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDeselectSingleLights}>
          <MaterialIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    );
  }
  
  // Existing string/wreath controls...
}
```

### 7. Asset Selection Behavior

#### Mode-Aware Asset Selection

**String Mode**:
- Asset stays selected for continuous string creation
- Auto-deselects on mode switch

**Tap Mode**:
- Asset stays selected for continuous tap placement
- Visual indication that tap mode is active
- Asset remains selected when switching back to string mode

**Wreath Mode**:
- Asset auto-deselects after placement (existing behavior)
- Returns to previous mode (string or tap)

#### Implementation
```javascript
const handleAssetSelection = (asset) => {
  setSelectedAsset(asset);
  
  // Don't auto-switch mode if already in tap mode
  if (interactionMode !== 'tap') {
    if (asset.category === 'wreath') {
      setInteractionMode('wreath');
    } else {
      setInteractionMode('string');
    }
  }
};
```

## Implementation Phases

### Phase 1: Core Functionality (MVP)
**Target**: Basic tap placement working

1. **UI Toggle**: Add mode switch to BottomToolbar
2. **Data Layer**: Implement `useSingleLights` hook
3. **Gesture Logic**: Modify tap detection in `useVectorDrawing`
4. **Rendering**: Create `SingleLightRenderer` component
5. **Integration**: Connect all pieces in `ImageViewer`

**Estimated Time**: 12-15 hours

### Phase 2: Enhanced UX
**Target**: Production-ready experience

1. **Visual Feedback**: Placement preview and animations
2. **Selection System**: Multi-select and management controls
3. **Undo System**: Extend to cover single lights
4. **Performance**: Optimize for many single lights

**Estimated Time**: 8-10 hours

### Phase 3: Advanced Features
**Target**: Power user functionality

1. **Drag Repositioning**: Move single lights after placement
2. **Bulk Operations**: Group/convert operations
3. **Smart Suggestions**: Auto-connect nearby lights
4. **Export Integration**: Include in image exports

**Estimated Time**: 6-8 hours

## Risk Mitigation

### 1. Gesture Conflicts
**Risk**: Tap mode interferes with zoom/pan
**Mitigation**: Existing multi-touch detection prevents conflicts

### 2. User Confusion
**Risk**: Users don't understand mode switching
**Mitigation**: Clear visual indicators and mode-specific UI feedback

### 3. Performance Issues
**Risk**: Many single lights cause lag
**Mitigation**: Efficient rendering strategies and optional virtualization

### 4. Regression Bugs
**Risk**: Breaking existing functionality
**Mitigation**: Comprehensive testing and feature flags for gradual rollout

## Success Metrics

### Technical Metrics
- [ ] Zero regression in existing zoom/drag performance
- [ ] Tap placement accuracy within 5px of touch point
- [ ] Smooth performance with 100+ single lights
- [ ] Mode switching under 100ms

### User Experience Metrics
- [ ] Users can discover and activate tap mode within 30 seconds
- [ ] Mode switching feels intuitive and responsive
- [ ] No accidental placements during zoom/pan operations
- [ ] Clear visual feedback for all interaction states

## Conclusion

This solution design provides a comprehensive path for adding tap-to-place functionality while preserving the excellent existing gesture handling system. The key advantages of this approach:

1. **Minimal Risk**: Leverages existing conflict resolution mechanisms
2. **Clear Separation**: Mode-based approach prevents confusion
3. **Extensible**: Architecture supports future enhancements
4. **Performance**: Efficient implementation suitable for production

The phased implementation approach allows for iterative development and testing, ensuring a high-quality user experience at each stage.