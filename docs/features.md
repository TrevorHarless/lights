# Current Priority --> more light options, colors, etc... wreaths and other decor. 

# Performance issues when adding a lot of lights (8+ light strings -> 130 individual SVG's, how can we improve?)


# More Features for Editor Page
- Need roof line lights
- Need mini lights - close together
- Wreaths
- Wreath with Bow
- Ability to put an individual light
- Option to export directly to iMessage/Photo Lib
- When selecting a line: can move edges and entire line
- Zoom in on photo for precise placement -- maintain overal light placement when doing this
- Cost estimate based on amount of lights in image...? idk how this would work, talk to Justin
- Dynamic link to phone call or imessage in project details modal, dynamic link to address to google maps or apple maps for address


  # Images Manipulation in Supabse Storage
  - Problem: Images are currently uploaded at their full size, takes up too much space especially at scale (100 users * 10 projects * 10mb image --> 10 gigs of data... yea, no good.)


  # Small TODOs
  - TextInput box resizes when typing for the Search feature
  - Project details modal needs refining -- mainly top right buttons 


  # Planning for features

  ## Steps for implementing more lights and wreaths
1. Enhanced Light Quality (hooks/editor/useLightAssets.js:5-174)

  - Current lights have basic 3-layer gradients (outer, middle, inner)
  - Improvements needed:
    - Add more realistic light styles (LED bulbs, icicle lights, globe
  lights)
    - Enhance gradient complexity for better realism
    - Add animated effects (twinkle, fade, color cycling)
    - Increase light detail with better shadows and highlights

  2. Expanded Light Library

  - Add professional-grade light types:
    - C9 Christmas bulbs with realistic bulb shape
    - Mini LED strings with smaller, brighter points
    - Icicle lights with varying lengths
    - Net lights for covering large areas
    - Projection lights for ground coverage

  Next Steps for Wreath System

  3. Wreath Component Architecture

  The wreath system needs to be fundamentally different from light strings:

  Light Strings: Vector-based (start/end points) with lights distributed
  along path
  Wreaths: Shape-based (center + radius) with lights distributed around
  perimeter

  4. Implementation Plan:

  1. Create Wreath Shape System:
    - New hook: useWreathShapes.js (similar to useLightStrings.js)
    - Wreath data structure: { id, center: {x, y}, radius, assetId,
  lightSpacing }
    - Circle/oval path generation for light placement
  2. Enhanced Asset System:
    - Extend useLightAssets.js to support both linear and circular light
  arrangements
    - Add wreath-specific assets (garland, ribbon lights, etc.)
  3. Resizable Interaction System:
    - Modify useVectorDrawing.js or create useShapeDrawing.js
    - Add resize handles around wreath perimeter
    - Implement pinch-to-resize gestures
    - Drag-to-move center point
  4. Updated Rendering:
    - Extend LightStringRenderer.jsx to handle both strings and shapes
    - Or create separate WreathRenderer.jsx component
    - Add visual resize handles when selected
  5. UI Updates:
    - Update asset selector to show both string and shape light types
    - Add toggle between "String Mode" and "Shape Mode"
    - Update floating controls for shape-specific actions

  5. Technical Implementation Details:

  // New wreath data structure
  const wreath = {
    id: "wreath_123",
    type: "circle", // or "oval"
    center: { x: 200, y: 200 },
    radius: 100,
    assetId: "warm-white",
    lightSpacing: 15
  };

  // Light position calculation for wreaths
  const calculateWreathLightPositions = (wreath) => {
    const circumference = 2 * Math.PI * wreath.radius;
    const lightCount = Math.floor(circumference / wreath.lightSpacing);
    const angleStep = (2 * Math.PI) / lightCount;

    return Array.from({ length: lightCount }, (_, i) => ({
      x: wreath.center.x + wreath.radius * Math.cos(i * angleStep),
      y: wreath.center.y + wreath.radius * Math.sin(i * angleStep)
    }));
  };

  6. Priority Order:

  1. Enhanced Light Assets - Immediate visual impact for existing features
  2. Wreath Shape System - Core architecture for new functionality
  3. Drag/Drop/Resize for Wreaths - Interactive capabilities
  4. UI Integration - Seamless user experience
  5. Advanced Features - Animations, effects, more shape types

  This approach leverages your existing solid foundation while adding the
  professional-quality lights and wreath functionality that holiday light
  installation companies need for impressive mockups.