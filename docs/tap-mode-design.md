# Tap Mode Feature Design

## Feature Overview

**Tap Mode** is a new interaction mode that allows users to place individual lights with single taps instead of creating entire light strings through drag gestures. This provides more precise control for custom light arrangements and faster placement for sparse lighting designs.

## User Experience Goals

### Primary Use Cases
1. **Precise Placement**: Position individual lights at exact locations
2. **Sparse Arrangements**: Create scattered light patterns without connecting strings
3. **Custom Patterns**: Build complex designs that don't follow linear paths
4. **Quick Placement**: Rapidly add multiple lights without drag gestures

### User Flow
1. User enables "Tap Mode" via UI toggle
2. User selects a light asset type
3. User taps locations on the image to place individual lights
4. Each tap creates a single light at that position
5. User can switch back to "String Mode" for traditional drag behavior

## Technical Architecture

### 1. Mode Management

#### New Interaction Modes
Extend the current `interactionMode` state:
```javascript
// Current: 'string' | 'wreath'
// New: 'string' | 'wreath' | 'tap'
```

#### Mode Toggle Interface
Add mode selection to the BottomToolbar:
- **String Mode**: Current drag-to-create behavior
- **Tap Mode**: New tap-to-place behavior
- Visual indicator showing active mode

### 2. Data Structure Changes

#### Individual Light Storage
Create new data structure for single lights:
```javascript
{
  id: string,
  position: { x: number, y: number },
  assetId: string,
  timestamp: number,
  groupId?: string, // Optional grouping
}
```

#### State Management
Add to ImageViewer state:
```javascript
const [singleLights, setSingleLights] = useState([]);
const [selectedLightIds, setSelectedLightIds] = useState([]); // Multi-select
```

### 3. Gesture Handling Modifications

#### Tap Detection Enhancement
Modify `useVectorDrawing.js` to handle tap mode:

```javascript
// Enhanced tap detection in onPanResponderRelease
if (isTap) {
  if (interactionMode === 'tap' && selectedAsset) {
    // Place single light
    placeSingleLight({ x: locationX, y: locationY });
  } else {
    // Existing selection logic
    handleLightSelection({ x: locationX, y: locationY });
  }
}
```

#### Gesture Priority System
**Priority Order**:
1. **Navigation gestures** (zoom/pan) - highest priority
2. **Tap Mode placement** - when tap mode active + asset selected
3. **Selection taps** - for existing lights/strings
4. **Drag operations** - string creation, wreath manipulation

### 4. Selection System Enhancements

#### Multi-Target Selection
Support selecting both individual lights and light strings:
- **Single lights**: Direct tap selection
- **Light strings**: Existing closest-string logic
- **Visual feedback**: Different highlight styles for each type

#### Selection States
```javascript
{
  selectedStringId: string | null,
  selectedWreathId: string | null,
  selectedSingleLights: string[], // New: array for multi-select
  selectionMode: 'single' | 'multiple' | 'none'
}
```

## User Interface Design

### 1. Mode Toggle Control

#### BottomToolbar Enhancement
Add mode toggle between existing ruler and light buttons:
```
[Ruler] [String/Tap Toggle] [Light Assets] [Undo]
```

#### Toggle States
- **String Mode**: Chain link icon + "String" label
- **Tap Mode**: Cursor/crosshair icon + "Tap" label
- **Active State**: Highlighted background color

### 2. Visual Feedback

#### Placement Preview
When in tap mode with asset selected:
- Show ghost/preview light at touch position
- Update in real-time as finger moves
- Disappear on lift without placement

#### Mode Indicators
- **Cursor Change**: Visual indicator showing tap mode active
- **Asset Selection**: Persistent highlighting when in tap mode
- **Placement Confirmation**: Brief animation on successful placement

### 3. Management Controls

#### Single Light Controls
Extend `FloatingSelectionControls` for single lights:
- **Delete**: Remove selected single lights
- **Group**: Convert selected lights to string
- **Move**: Drag to reposition (optional enhancement)

#### Bulk Operations
- **Select All**: Select all visible single lights
- **Clear Singles**: Remove all single lights
- **Convert to String**: Connect selected lights in placement order

## Implementation Strategy

### Phase 1: Core Functionality
1. **Mode Toggle**: Add UI and state management
2. **Basic Tap Placement**: Single light creation
3. **Selection Integration**: Include single lights in selection system
4. **Visual Rendering**: Render single lights alongside strings

### Phase 2: Enhanced Features
1. **Multi-Selection**: Select multiple single lights
2. **Grouping**: Convert singles to strings
3. **Bulk Operations**: Mass delete, clear, etc.
4. **Undo System**: Extend undo to cover single lights

### Phase 3: Advanced Features
1. **Drag Repositioning**: Move single lights after placement
2. **Smart Grouping**: Auto-suggest string connections
3. **Pattern Tools**: Grid placement, symmetry tools
4. **Export Enhancement**: Include single lights in export

## Technical Considerations

### 1. Performance
- **Rendering**: Efficient rendering of potentially many individual lights
- **Hit Testing**: Fast collision detection for selection
- **Memory**: Optimize data structures for large numbers of single lights

### 2. Gesture Conflicts
- **Tap Disambiguation**: Clear rules for tap vs selection
- **Mode Awareness**: Gesture handlers must respect current mode
- **Error Prevention**: Avoid accidental placements

### 3. Data Persistence
- **Storage Format**: Extend project data to include single lights
- **Migration**: Handle existing projects without single lights
- **Export/Import**: Include in all data operations

### 4. Platform Differences
- **Touch Sensitivity**: Ensure consistent behavior across devices
- **Performance**: Optimize for different screen sizes and capabilities
- **Accessibility**: Support for assistive technologies

## User Testing Considerations

### Usability Tests
1. **Mode Discovery**: Can users find and understand tap mode?
2. **Gesture Learning**: How quickly do users adapt to tap placement?
3. **Mode Switching**: Is toggling between modes intuitive?
4. **Selection Clarity**: Can users distinguish between light types?

### Edge Cases
1. **Accidental Placement**: How to prevent/handle unwanted taps?
2. **Dense Placement**: Selection accuracy with many nearby lights?
3. **Performance Limits**: Behavior with hundreds of single lights?
4. **Mode Conflicts**: Clear behavior when modes conflict?

## Success Metrics

### User Engagement
- **Adoption Rate**: Percentage of users who try tap mode
- **Usage Frequency**: How often tap mode is used vs string mode
- **Session Duration**: Time spent in each mode
- **Error Rate**: Accidental placements or selection mistakes

### Feature Effectiveness
- **Placement Accuracy**: Users achieve intended light positions
- **Workflow Efficiency**: Faster completion of sparse lighting tasks
- **User Satisfaction**: Qualitative feedback on feature usefulness
- **Retention**: Users continue using tap mode over time

## Future Enhancements

### Smart Features
- **Auto-Connect**: Suggest connecting nearby single lights
- **Pattern Recognition**: Detect and replicate light patterns
- **Snap-to-Grid**: Optional grid-based placement
- **Symmetry Tools**: Mirror and rotate light patterns

### Advanced Interactions
- **Multi-Touch**: Place multiple lights simultaneously
- **Gesture Shortcuts**: Quick selection and operation gestures
- **Voice Control**: "Place red light here" style commands
- **AR Integration**: Real-world overlay for outdoor installations

This design provides a comprehensive foundation for implementing Tap Mode while maintaining compatibility with existing functionality and providing clear paths for future enhancements.