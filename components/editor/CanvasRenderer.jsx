// components/editor/CanvasRenderer.jsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const CanvasRenderer = ({
  lightStrings,
  currentVector,
  isDragging,
  selectedStringId,
  getAssetById,
  calculateLightPositions,
  getLightSizeScale,
  width,
  height,
}) => {
  const lightScale = getLightSizeScale ? getLightSizeScale() : 1;

  // Generate light data for the canvas
  const lightData = useMemo(() => {
    const data = {
      strings: [],
      currentVector: null,
      selectedStringId,
      scale: lightScale,
      width,
      height,
    };

    // Process existing light strings
    lightStrings.forEach((string) => {
      const asset = getAssetById(string.assetId);
      if (!asset) return;

      const positions = calculateLightPositions(string, asset.spacing);
      data.strings.push({
        id: string.id,
        assetId: asset.id,
        positions: positions,
        centerOffset: asset.centerOffset || { x: 15, y: 15 },
      });
    });

    // Process current vector if dragging
    if (currentVector && isDragging) {
      const asset = getAssetById(currentVector.assetId);
      if (asset) {
        const positions = calculateLightPositions(currentVector, asset.spacing);
        data.currentVector = {
          assetId: asset.id,
          positions: positions,
          centerOffset: asset.centerOffset || { x: 15, y: 15 },
          path: currentVector,
        };
      }
    }

    return data;
  }, [lightStrings, currentVector, isDragging, selectedStringId, getAssetById, calculateLightPositions, lightScale, width, height]);

  // HTML content for the WebView with Canvas
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        canvas { display: block; }
      </style>
    </head>
    <body>
      <canvas id="lightCanvas" width="${width}" height="${height}"></canvas>
      <script>
        const canvas = document.getElementById('lightCanvas');
        const ctx = canvas.getContext('2d');
        
        // Light rendering functions
        function renderC9WarmWhite(ctx, x, y, scale) {
          const size = 22 * scale;
          
          // Outer glow
          const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          outerGradient.addColorStop(0, 'rgba(255, 245, 224, 0.6)');
          outerGradient.addColorStop(0.4, 'rgba(255, 245, 224, 0.3)');
          outerGradient.addColorStop(1, 'rgba(255, 245, 224, 0)');
          
          ctx.fillStyle = outerGradient;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 2 * Math.PI);
          ctx.fill();

          // Middle glow
          const middleSize = 12 * scale;
          const middleGradient = ctx.createRadialGradient(x, y, 0, x, y, middleSize);
          middleGradient.addColorStop(0, 'rgba(255, 250, 240, 0.9)');
          middleGradient.addColorStop(0.6, 'rgba(255, 237, 217, 0.7)');
          middleGradient.addColorStop(1, 'rgba(255, 237, 217, 0.4)');
          
          ctx.fillStyle = middleGradient;
          ctx.beginPath();
          ctx.arc(x, y, middleSize, 0, 2 * Math.PI);
          ctx.fill();

          // Bulb
          const bulbSize = 6 * scale;
          const bulbGradient = ctx.createRadialGradient(x, y, 0, x, y, bulbSize);
          bulbGradient.addColorStop(0, '#ffffff');
          bulbGradient.addColorStop(0.3, '#fffaf0');
          bulbGradient.addColorStop(0.7, '#ffe8c4');
          bulbGradient.addColorStop(1, '#ddb88a');
          
          ctx.fillStyle = bulbGradient;
          ctx.beginPath();
          ctx.arc(x, y, bulbSize, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.strokeStyle = '#cc9966';
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();

          // Center highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 2 * scale, 0, 2 * Math.PI);
          ctx.fill();

          // Small highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(x - 2 * scale, y - 2 * scale, 0.8 * scale, 0, 2 * Math.PI);
          ctx.fill();
        }

        function renderMiniLedWarm(ctx, x, y, scale) {
          const size = 12 * scale;
          
          // Outer glow
          const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          outerGradient.addColorStop(0, 'rgba(255, 245, 224, 0.7)');
          outerGradient.addColorStop(0.5, 'rgba(255, 245, 224, 0.3)');
          outerGradient.addColorStop(1, 'rgba(255, 245, 224, 0)');
          
          ctx.fillStyle = outerGradient;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 2 * Math.PI);
          ctx.fill();

          // Inner glow
          const innerSize = 4 * scale;
          const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, innerSize);
          innerGradient.addColorStop(0, '#ffffff');
          innerGradient.addColorStop(0.5, '#fffaf0');
          innerGradient.addColorStop(1, '#ffe8c4');
          
          ctx.fillStyle = innerGradient;
          ctx.beginPath();
          ctx.arc(x, y, innerSize, 0, 2 * Math.PI);
          ctx.fill();

          // Center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 1 * scale, 0, 2 * Math.PI);
          ctx.fill();
        }

        function renderGenericLight(ctx, x, y, scale, color = '#ffffff') {
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(x, y, 8 * scale, 0, 2 * Math.PI);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        function renderLight(ctx, x, y, assetId, scale, lightIndex = 0) {
          switch (assetId) {
            case 'c9-warm-white':
            case 'warm-white':
              renderC9WarmWhite(ctx, x, y, scale);
              break;
            case 'mini-led-warm':
            case 'net-warm-white':
              renderMiniLedWarm(ctx, x, y, scale);
              break;
            case 'c9-multicolor':
              const colors = ["#ff3333", "#33ff33", "#3333ff", "#ffff33", "#ff33ff"];
              const color = colors[lightIndex % colors.length];
              renderGenericLight(ctx, x, y, scale, color);
              break;
            case 'glow-light-blue':
              renderGenericLight(ctx, x, y, scale, '#3388ff');
              break;
            default:
              renderGenericLight(ctx, x, y, scale);
          }
        }

        // Main render function
        function render(data) {
          // Clear canvas
          ctx.clearRect(0, 0, data.width, data.height);
          
          // Render selection highlighting
          if (data.selectedStringId) {
            const selectedString = data.strings.find(s => s.id === data.selectedStringId);
            if (selectedString && selectedString.positions.length >= 2) {
              const start = selectedString.positions[0];
              const end = selectedString.positions[selectedString.positions.length - 1];
              
              ctx.strokeStyle = '#007aff';
              ctx.lineWidth = 3;
              ctx.globalAlpha = 0.7;
              ctx.beginPath();
              ctx.moveTo(start.x, start.y);
              ctx.lineTo(end.x, end.y);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }

          // Render current vector path
          if (data.currentVector && data.currentVector.path) {
            const path = data.currentVector.path;
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(path.start.x, path.start.y);
            ctx.lineTo(path.end.x, path.end.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Render all lights from strings
          data.strings.forEach((string) => {
            string.positions.forEach((pos, idx) => {
              renderLight(ctx, pos.x, pos.y, string.assetId, data.scale, idx);
            });
          });

          // Render current vector lights
          if (data.currentVector) {
            ctx.globalAlpha = 0.8;
            data.currentVector.positions.forEach((pos, idx) => {
              renderLight(ctx, pos.x, pos.y, data.currentVector.assetId, data.scale, idx);
            });
            ctx.globalAlpha = 1;
          }
        }

        // Listen for data updates from React Native
        window.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          render(data);
        });

        // Initial render with empty data
        render({ strings: [], currentVector: null, selectedStringId: null, scale: 1, width: ${width}, height: ${height} });
      </script>
    </body>
    </html>
  `;

  // Send data to WebView when it changes
  const webViewRef = React.useRef(null);
  React.useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(lightData));
    }
  }, [lightData]);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={(event) => {
          // Handle messages from WebView if needed
        }}
      />
    </View>
  );
};

export default React.memo(CanvasRenderer);