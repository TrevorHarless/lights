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
                borderRadius: style.borderRadius || 0,
              }
            ]}
          />
        );
      })}
    </>
  );
}