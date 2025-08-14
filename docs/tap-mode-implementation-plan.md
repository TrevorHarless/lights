# Tap Mode Implementation Plan

## Overview

This document provides a detailed, step-by-step implementation plan for adding "Tap Mode" functionality to the lights-app. The plan is organized into phases with specific tasks, file changes, and testing requirements.

## Phase 1: Core Infrastructure (MVP)

### Task 1.1: Extend Interaction Mode System
**Estimated Time**: 2-3 hours

**Files to Modify**:
- `components/editor/ImageViewer.jsx`

**Changes**:
1. Update `interactionMode` state to support `'tap'` mode:
```javascript
// Current: 'string' | 'wreath'
// New: 'string' | 'wreath' | 'tap'
const [interactionMode, setInteractionMode] = React.useState('string');
```

2. Add mode switching logic:
```javascript
const switchToTapMode = () => setInteractionMode('tap');
const switchToStringMode = () => setInteractionMode('string');
```

3. Update auto-mode switching to preserve tap mode:
```javascript
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

### Task 1.2: Create Single Light Data Management
**Estimated Time**: 3-4 hours

**New File**: `hooks/editor/useSingleLights.js`

**Implementation**:
```javascript
export function useSingleLights() {
  const [singleLights, setSingleLights] = useState([]);
  const [selectedSingleLightIds, setSelectedSingleLightIds] = useState([]);

  const addSingleLight = (position, assetId) => {
    const newLight = {
      id: `single-${Date.now()}-${Math.random()}`,
      position,
      assetId,
      timestamp: Date.now(),
    };
    setSingleLights(prev => [...prev, newLight]);
    return newLight.id;
  };

  const removeSingleLight = (lightId) => {
    setSingleLights(prev => prev.filter(light => light.id !== lightId));
    setSelectedSingleLightIds(prev => prev.filter(id => id !== lightId));
  };

  const clearAllSingleLights = () => {
    setSingleLights([]);
    setSelectedSingleLightIds([]);
  };

  const selectSingleLight = (lightId) => {
    setSelectedSingleLightIds([lightId]);
  };

  const findSingleLightAtPoint = (point, threshold = 20) => {
    return singleLights.find(light => {
      const distance = Math.sqrt(
        Math.pow(point.x - light.position.x, 2) + 
        Math.pow(point.y - light.position.y, 2)
      );
      return distance <= threshold;
    });
  };

  return {
    singleLights,
    selectedSingleLightIds,
    addSingleLight,
    removeSingleLight,
    clearAllSingleLights,
    selectSingleLight,
    findSingleLightAtPoint,
  };
}
```

**Integration in ImageViewer**:
```javascript
const {
  singleLights,
  selectedSingleLightIds,
  addSingleLight,
  removeSingleLight,
  findSingleLightAtPoint,
  selectSingleLight,
} = useSingleLights();
```

### Task 1.3: Enhance Gesture Handling for Tap Mode
**Estimated Time**: 4-5 hours

**Files to Modify**:
- `hooks/editor/useVectorDrawing.js`

**Changes**:
1. Add tap mode support to hook parameters:
```javascript
export function useVectorDrawing({
  selectedAsset,
  onVectorComplete,
  onTapSelection,
  findClosestLightString,
  deselectLightString,
  isSettingReference = false,
  onReferenceComplete = null,
  // New parameters
  interactionMode = 'string',
  onSingleLightPlace = null,
  findSingleLightAtPoint = null,
}) {
```

2. Modify tap handling logic in `onPanResponderRelease`:
```javascript
if (isTap) {
  const point = { x: locationX, y: locationY };
  
  if (interactionMode === 'tap' && selectedAsset && onSingleLightPlace) {
    // Tap Mode: Place single light
    onSingleLightPlace(point, selectedAsset.id);
  } else {
    // Existing selection logic
    const closestString = findClosestLightString(point);
    const closestSingleLight = findSingleLightAtPoint?.(point);
    
    if (closestSingleLight) {
      // Select single light
      onTapSelection('single', closestSingleLight.id);
    } else if (closestString) {
      // Select light string
      onTapSelection('string', closestString.id);
    } else {
      // Deselect all
      deselectLightString();
    }
  }
}
```

3. Update gesture activation conditions:
```javascript
onPanResponderMove: (evt, gestureState) => {
  if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
    // Only start dragging if NOT in tap mode
    if (interactionMode !== 'tap' && (selectedAsset || isSettingReference) && !isDragging) {
      setIsDragging(true);
      // ... existing drag logic
    }
  }
}
```

### Task 1.4: Create Single Light Renderer
**Estimated Time**: 2-3 hours

**New File**: `components/editor/SingleLightRenderer.jsx`

**Implementation**:
```javascript
import React from 'react';
import { View } from 'react-native';

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
        if (!asset) return null;

        const scale = getLightSizeScale();
        const style = getLightRenderStyle(light.assetId, scale);
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

**Integration in ImageViewer**:
```javascript
<View style={[StyleSheet.absoluteFill, styles.lightsLayer]} {...activePanResponder.panHandlers}>
  <SimpleLightRenderer ... />
  
  {/* Add single light renderer */}
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

### Task 1.5: Add Mode Toggle UI
**Estimated Time**: 3-4 hours

**Files to Modify**:
- `components/editor/BottomToolbar.jsx`

**Changes**:
1. Add mode toggle button:
```javascript
export function BottomToolbar({
  // Existing props...
  // New props
  interactionMode,
  onModeChange,
}) {
  return (
    <View style={toolbarStyle}>
      {/* Ruler Tool */}
      <TouchableOpacity ...>
        <MaterialIcons name="straighten" ... />
      </TouchableOpacity>
      
      {/* Mode Toggle - NEW */}
      <TouchableOpacity 
        style={{ padding: 8 }} 
        onPress={() => onModeChange(interactionMode === 'tap' ? 'string' : 'tap')}
      >
        <MaterialIcons 
          name={interactionMode === 'tap' ? 'touch-app' : 'timeline'} 
          size={28} 
          color={interactionMode === 'tap' ? '#FF9800' : 'white'} 
        />
      </TouchableOpacity>
      
      {/* Light Selection */}
      <TouchableOpacity ...>
        <MaterialIcons name="lightbulb-outline" ... />
      </TouchableOpacity>
      
      {/* Undo */}
      <TouchableOpacity ...>
        <MaterialIcons name="undo" ... />
      </TouchableOpacity>
    </View>
  );
}
```

2. Update ImageViewer to pass new props:
```javascript
<BottomToolbar
  // Existing props...
  interactionMode={interactionMode}
  onModeChange={setInteractionMode}
/>
```

## Phase 2: Enhanced Selection and Management

### Task 2.1: Enhance Selection System
**Estimated Time**: 3-4 hours

**Files to Modify**:
- `components/editor/FloatingSelectionControls.jsx`

**Changes**:
1. Add support for single light selection:
```javascript
export function FloatingSelectionControls({
  // Existing props...
  // New props
  selectedSingleLightIds,
  onDeleteSingleLights,
  onDeselectSingleLights,
}) {
  // Show controls for single lights
  if (selectedSingleLightIds.length > 0) {
    return (
      <View style={floatingControlStyle}>
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

### Task 2.2: Extend Undo System
**Estimated Time**: 2-3 hours

**Files to Modify**:
- `hooks/editor/useSingleLights.js`

**Changes**:
1. Add undo functionality:
```javascript
const [deletedSingleLights, setDeletedSingleLights] = useState([]);

const removeSingleLight = (lightId) => {
  const lightToDelete = singleLights.find(light => light.id === lightId);
  if (lightToDelete) {
    setDeletedSingleLights([lightToDelete]);
    setSingleLights(prev => prev.filter(light => light.id !== lightId));
  }
};

const undoDeleteSingleLight = () => {
  if (deletedSingleLights.length > 0) {
    setSingleLights(prev => [...prev, ...deletedSingleLights]);
    setDeletedSingleLights([]);
  }
};
```

## Phase 3: Polish and Optimization

### Task 3.1: Visual Enhancements
**Estimated Time**: 3-4 hours

**Files to Modify**:
- `components/editor/SingleLightRenderer.jsx`
- `components/editor/ImageViewer.jsx`

**Enhancements**:
1. **Placement Preview**: Ghost light following touch in tap mode
2. **Selection Indicators**: Clear visual feedback for selected single lights
3. **Mode Indicators**: Visual cues when tap mode is active
4. **Animations**: Smooth placement and selection animations

### Task 3.2: Performance Optimization
**Estimated Time**: 2-3 hours

**Focus Areas**:
1. **Efficient Rendering**: Optimize for many single lights
2. **Hit Testing**: Fast collision detection for selection
3. **Memory Management**: Prevent memory leaks with large datasets

### Task 3.3: Testing and Bug Fixes
**Estimated Time**: 4-5 hours

**Test Cases**:
1. **Basic Functionality**: Tap placement, selection, deletion
2. **Mode Switching**: Seamless transitions between modes
3. **Gesture Conflicts**: No interference with existing gestures
4. **Edge Cases**: Dense placement, rapid tapping, error conditions
5. **Performance**: Behavior with 100+ single lights

## Implementation Notes

### Development Order
1. **Start with Phase 1 Task 1.1** - establishes the foundation
2. **Complete Phase 1 sequentially** - each task builds on the previous
3. **Test Phase 1 thoroughly** before moving to Phase 2
4. **Phase 2 and 3 can be done in parallel** once Phase 1 is stable

### Code Quality Guidelines
1. **TypeScript**: Add proper type definitions for all new structures
2. **Testing**: Write unit tests for all new hooks and utilities
3. **Documentation**: Update component documentation and PropTypes
4. **Performance**: Profile rendering performance with large datasets

### Integration Testing
1. **Gesture Testing**: Verify no conflicts with existing gestures
2. **Mode Testing**: Ensure clean transitions between all modes
3. **Asset Testing**: Verify all light assets work in tap mode
4. **Export Testing**: Ensure single lights are included in image exports

### Rollback Plan
Each phase should be implemented as a feature flag, allowing for:
1. **Quick Disable**: Turn off tap mode if critical issues arise
2. **A/B Testing**: Compare user behavior with/without tap mode
3. **Gradual Rollout**: Enable for percentage of users initially

## Success Criteria

### Phase 1 Complete
- [ ] Users can toggle between string and tap modes
- [ ] Single lights can be placed with taps
- [ ] Single lights render correctly
- [ ] Basic selection and deletion works
- [ ] No regression in existing functionality

### Phase 2 Complete
- [ ] Multi-selection of single lights works
- [ ] Undo system covers single lights
- [ ] Enhanced selection controls are intuitive
- [ ] All gesture combinations work correctly

### Phase 3 Complete
- [ ] Performance is acceptable with 100+ lights
- [ ] Visual polish meets design standards
- [ ] All edge cases are handled gracefully
- [ ] Feature is ready for production release

This implementation plan provides a clear roadmap for adding Tap Mode while maintaining the existing functionality and ensuring a high-quality user experience.