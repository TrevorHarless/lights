# Gesture Handling System Analysis

## Overview

The lights-app uses a sophisticated multi-modal gesture handling system to support different interaction modes for placing and manipulating light assets. The current system primarily supports **drag-based interactions** for creating light strings and placing/manipulating wreaths.

## Core Architecture

### Main Components

#### 1. ImageViewer Component (`components/editor/ImageViewer.jsx`)
- **Central hub** for all gesture handling
- Manages interaction modes: `'string'` or `'wreath'`
- Coordinates multiple gesture systems:
  - Zoom/pan gestures for image navigation
  - String drawing gestures
  - Wreath manipulation gestures
- Auto-switches modes based on selected asset type

#### 2. Vector Drawing System (`hooks/editor/useVectorDrawing.js`)
- **Primary gesture handler** for light string creation
- Uses `PanResponder` API
- Handles both **tap-to-select** and **drag-to-draw** interactions
- Supports reference line drawing mode

#### 3. Wreath Gesture System (`hooks/editor/useWreathGestures.js`)
- Dedicated gesture handler for wreath assets
- Supports placement, movement, and resizing
- Uses `PanResponder` with complex state management

#### 4. Asset Management (`hooks/editor/useLightAssets.js`)
- Provides light asset definitions and utilities
- Used by gesture handlers to determine interaction behavior

## Current Gesture Modes

### 1. String Drawing Mode (Default)
**Primary Handler**: `useVectorDrawing.js`

**Gesture Types**:
- **Tap**: Select/deselect existing light strings
- **Drag**: Create new light strings from start to end point
- **Special**: Reference line creation when in reference mode

**Flow**:
1. User selects a light asset from BottomToolbar
2. System enters string drawing mode
3. User drags on canvas to create light string vector
4. System calculates light positions along the vector
5. Lights are rendered with selected asset style

### 2. Wreath Manipulation Mode
**Primary Handler**: `useWreathGestures.js`

**Gesture Types**:
- **Tap**: Place new wreath or select existing wreath
- **Drag on wreath center**: Move wreath
- **Drag on resize handles**: Resize wreath
- **Tap empty space**: Deselect wreath

**Flow**:
1. User selects a wreath asset
2. System auto-switches to wreath mode
3. Tap places new wreath, drag manipulates existing ones

### 3. Navigation Mode
**Handler**: Built into `ImageViewer.jsx`

**Gesture Types**:
- **Pinch**: Zoom in/out (scale limits: 0.5x to 6x)
- **Two-finger pan**: Move image when zoomed
- **Reset**: Manual reset zoom button

## Gesture Detection Logic

### Tap vs Drag Discrimination
**Implementation**: `useVectorDrawing.js` lines 75-78

```javascript
const isTap = 
  Math.abs(gestureState.dx) < 5 &&
  Math.abs(gestureState.dy) < 5 &&
  Date.now() - lastTapTime < 300;
```

**Thresholds**:
- **Movement**: < 5 pixels in any direction
- **Time**: < 300ms duration
- **Action**: Tap triggers selection, drag triggers creation

### Mode Switching Logic
**Implementation**: `ImageViewer.jsx` lines 119-127

```javascript
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

## State Management

### Gesture State Tracking
- **Vector Drawing**: Uses React state + useRef for gesture tracking
- **Wreath Gestures**: Uses useRef for complex gesture state
- **Image Navigation**: Uses react-native-reanimated shared values

### Asset Selection
- **Central State**: Managed in `ImageViewer.jsx`
- **UI Components**: `BottomToolbar`, `LightSelectionPopover`
- **Auto-deselection**: Occurs after wreath placement

## User Interface Elements

### 1. BottomToolbar (`components/editor/BottomToolbar.jsx`)
**Purpose**: Primary asset selection interface
- Ruler tool for reference measurement
- Light bulb button opens asset picker
- Undo button for deleted strings

### 2. LightSelectionPopover
**Purpose**: Asset selection modal
- Categorized light assets
- Visual previews with render styles
- Closes after selection

### 3. FloatingSelectionControls
**Purpose**: Context-sensitive controls
- Delete buttons for selected items
- Positioned based on selected item location

## Current Limitations for Tap Mode

### 1. Drag-Centric Design
- All light creation requires drag gestures
- No single-tap placement mechanism
- UI assumes drag workflow

### 2. Asset Selection Model
- Assets auto-deselect after use (wreaths)
- No "sticky" selection mode for repeated placement
- Mode switching based on asset type

### 3. Gesture Conflict Potential
- Current tap detection serves selection only
- Would need to distinguish between selection and placement taps
- Existing thresholds may need adjustment

## Technical Dependencies

### Libraries Used
- **react-native-gesture-handler**: For gesture detection
- **react-native-reanimated**: For smooth animations
- **PanResponder**: Legacy gesture API (still used for complex logic)

### Performance Considerations
- Real-time gesture tracking
- Smooth rendering during drag operations
- Efficient collision detection for selection

## Integration Points

### 1. Hooks Integration
- Multiple gesture hooks work together
- Shared state through ImageViewer props
- Clear separation of concerns

### 2. Rendering System
- `SimpleLightRenderer`: Handles light string rendering
- `WreathRenderer`: Handles wreath rendering
- Dynamic style calculation based on assets

### 3. Storage/Persistence
- Light strings and wreaths stored separately
- Undo/redo system for light strings only
- Reference measurement persistence

## Summary

The current gesture handling system is well-architected for drag-based interactions but would require significant enhancements to support tap-based placement while maintaining existing functionality. The modular design provides good extension points, but careful consideration is needed to avoid gesture conflicts and maintain the intuitive user experience.