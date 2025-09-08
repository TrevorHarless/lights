# Light Assets

This directory contains PNG images for light rendering in the application.

## Current Light Assets:
- **Warm-White.png** - Warm white light
- **Red.png** - Red light
- **Blue.png** - Blue light  
- **Green.png** - Green light
- **Yellow.png** - Yellow light

## Image Requirements:
- **Format**: PNG (supports transparency)
- **Size**: High resolution (2x or 3x for retina displays)
- **Dimensions**: Around 48-96px (will be scaled in code)

## Adding New Light Assets:
1. Create or export your light design as PNG
2. Save it in this directory with a descriptive name
3. Update the light assets configuration in `hooks/editor/useLightAssets.js`

The application uses these images to render realistic light effects in the editor.