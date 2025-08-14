High Priority - Immediate Impact

1. Shared Gradient Definitions
   // Create one set of gradient definitions per light type, reuse across
   all instances
   const SHARED_GRADIENT_IDS = {
   'c9-warm-white': 'c9WarmOuter',
   'c9-multicolor': 'c9MultiOuter',
   // ... etc
   };

2. Single SVG Container
   // Render all lights in one SVG instead of multiple containers
   <Svg width="100%" height="100%">
   <Defs>{/_ All gradient definitions once _/}</Defs>
   {/_ All lights rendered here _/}
   </Svg>

3. Memoized Components
   // Memoize light components and position calculations
   const MemoizedLight = React.memo(LightComponent);
   const memoizedPositions = useMemo(() => calculateLightPositions(...),
   [deps]);

Medium Priority - Substantial Gains

4. Light Instancing

- Use SVG <use> elements to reference a single light definition
- Render base light once, instance it at different positions

5. Viewport Culling

- Only render lights visible in current zoom/pan viewport
- Implement virtual scrolling for light positions

6. Simplified Light Assets

- Reduce gradient complexity for distant zoom levels
- Use simpler circle fills instead of multiple gradients when zoomed out

Advanced Optimizations

7. Canvas Rendering Fallback

- Switch to Canvas API for high light counts (100+)
- Pre-render light textures as ImageData

8. Level-of-Detail (LOD)

- Show full detail when zoomed in
- Use simplified dots when zoomed out

9. Batched Updates

- Debounce light position updates during interactions
- Use requestAnimationFrame for smooth rendering
