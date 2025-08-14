# ImageViewer Architecture Documentation

## Overview

The `ImageViewer` component is the central hub of the lighting design editor. It manages the entire editing experience, including image display, light string placement, wreath placement, reference scaling, and various UI controls.

## Component Structure

### Main Component
- **Location**: `components/editor/ImageViewer.jsx`
- **Props**: 
  - `imgSource`: URI of the image to display
  - `onGoBack`: Callback for navigation back

### Core Functionality Areas

#### 1. Asset Management
- **Light Assets**: Managed via `useLightAssets()` hook
- **Wreath Assets**: Managed via `useWreathAssets()` hook  
- **Combined System**: Merges both asset types for unified selection

#### 2. Reference Scale System
- **Hook**: `useReferenceScale()`
- **Purpose**: Allows users to set real-world measurements for accurate light spacing
- **Components**: `ReferenceLineRenderer`, `ReferenceModal`

#### 3. Light String Management  
- **Hook**: `useLightStrings(lightAssets, getScaledLightSpacing)`
- **Purpose**: Handles creation, deletion, selection of light strings
- **Renderer**: `SimpleLightRenderer`

#### 4. Wreath Management
- **Hook**: `useWreathShapes()`
- **Purpose**: Handles creation, deletion, selection, movement, and resizing of wreaths
- **Renderer**: `WreathRenderer`
- **Gestures**: `useWreathGestures()`

#### 5. Drawing/Interaction System
- **Vector Drawing**: `useVectorDrawing()` for light string creation
- **Wreath Gestures**: `useWreathGestures()` for wreath manipulation
- **Mode Switching**: Auto-switches between 'string' and 'wreath' modes based on selected asset

## UI Component Hierarchy

```
ImageViewer (main container)
├── ImageWithNightOverlay (background image with night mode)
├── SimpleLightRenderer (light strings overlay)
├── ReferenceLineRenderer (measurement overlay)
├── WreathRenderer (wreath overlay)  
├── FloatingSelectionControls (delete/selection buttons)
├── BottomToolbar (main tool selection)
│   └── LightSelectionPopover (asset selection modal)
└── ReferenceModal (measurement input modal)
```

## State Management

### Local State (useState)
- `selectedAsset`: Currently selected light/wreath type
- `nightModeEnabled`: Boolean for night mode toggle
- `nightModeIntensity`: Float (0.1-0.9) for night overlay opacity
- `isMenuExpanded`: Boolean for expanded menu visibility
- `isExporting`: Boolean for export operation status
- `hasMediaPermission`: Boolean for media library access
- `selectedStringEndpoint`: Position data for selected string's endpoint
- `interactionMode`: String ('string' or 'wreath') for interaction mode

### Gesture State (useSharedValue)
- `scale`, `savedScale`: Zoom level management
- `translateX`, `translateY`: Pan position management
- `savedTranslateX`, `savedTranslateY`: Saved pan positions

### Hook-Managed State
- **Light Strings**: `lightStrings`, `selectedStringId`, `deletedString`
- **Wreaths**: `wreaths`, `selectedWreathId`
- **Reference**: `referenceLine`, `referenceLength`, `isSettingReference`, `showReferenceModal`
- **Drawing**: `currentVector`, `isDragging`

## Key Features

### 1. Multi-touch Gestures
- **Pinch**: Zoom in/out (0.5x to 6x range)
- **Two-finger Pan**: Move image when zoomed
- **Single Touch**: Drawing/selection based on mode

### 2. Night Mode
- Overlay system that matches image dimensions exactly
- Adjustable intensity (10% to 90%)
- Blue-tinted overlay (#0a1632) for realistic lighting preview

### 3. Export System
- Uses `react-native-view-shot` to capture entire canvas
- Saves to device media library in "Light Designer" album
- High quality JPG export (0.8 quality)

### 4. Interaction Modes
- **String Mode**: Draw light strings with selected light assets
- **Wreath Mode**: Place and manipulate wreaths
- **Reference Mode**: Set measurement scale for accurate sizing

## Performance Considerations

### Optimization Strategies
1. **Gesture Handling**: Uses `react-native-reanimated` for smooth animations
2. **Component Separation**: Renders different layers independently 
3. **Light Rendering**: `SimpleLightRenderer` optimized for performance
4. **State Management**: Efficient hooks prevent unnecessary re-renders

### Rendering Layers (z-index order)
1. **Base Image** (zIndex: 1)
2. **Night Mode Overlay** (zIndex: 2) 
3. **Lights & Wreaths** (zIndex: 10)
4. **UI Controls** (zIndex: 1000+)

## Data Flow Patterns

The ImageViewer exhibits significant prop drilling, passing data and callbacks down through multiple component levels:

### Major Prop Drilling Examples
1. **Asset System**: `lightAssets`, `getAssetsByCategory`, `getCategories`, etc.
2. **Reference System**: `hasReference`, `isSettingReference`, `onStartReference`, etc.
3. **Selection System**: `selectedStringId`, `selectedWreathId`, deletion callbacks
4. **State Callbacks**: Various `onDelete`, `onSelect`, `onUndo` functions

This creates a complex web of dependencies that would benefit from Context API refactoring.